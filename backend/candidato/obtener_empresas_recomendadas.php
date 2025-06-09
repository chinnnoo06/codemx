<?php
require_once '../config/conexion.php';

// Encabezados para CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID del candidato.']);
        http_response_code(400);
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    // Consultas separadas para obtener los datos
    $querySeguidores = "
        SELECT Empresa_ID, COUNT(*) AS Seguidores
        FROM seguidores
        GROUP BY Empresa_ID
    ";

    $queryReacciones = "
        SELECT 
            Publicacion_ID,
            COUNT(CASE WHEN Reaccion = 'like' THEN 1 END) AS TotalLikes,
            COUNT(CASE WHEN Reaccion = 'dislike' THEN 1 END) AS TotalDislikes
        FROM reacciones 
        GROUP BY Publicacion_ID
    ";

    $queryComentarios = "
        SELECT 
            Publicacion_ID,
            COUNT(*) AS TotalComentarios
        FROM comentarios
        GROUP BY Publicacion_ID
    ";

    $queryPublicaciones = "
        SELECT 
            Empresa_ID,
            COUNT(*) AS NumPublicaciones
        FROM publicacion
        GROUP BY Empresa_ID
    ";

    // Ejecutar las consultas
    $resultadoSeguidores = mysqli_query($conexion, $querySeguidores);
    $resultadoReacciones = mysqli_query($conexion, $queryReacciones);
    $resultadoComentarios = mysqli_query($conexion, $queryComentarios);
    $resultadoPublicaciones = mysqli_query($conexion, $queryPublicaciones);

    // Organizar los resultados en arrays asociativos
    $seguidores = [];
    while ($row = mysqli_fetch_assoc($resultadoSeguidores)) {
        $seguidores[$row['Empresa_ID']] = $row['Seguidores'];
    }

    $reacciones = [];
    while ($row = mysqli_fetch_assoc($resultadoReacciones)) {
        $reacciones[$row['Publicacion_ID']] = [
            'Likes' => $row['TotalLikes'],
            'Dislikes' => $row['TotalDislikes']
        ];
    }

    $comentarios = [];
    while ($row = mysqli_fetch_assoc($resultadoComentarios)) {
        $comentarios[$row['Publicacion_ID']] = $row['TotalComentarios'];
    }

    $publicaciones = [];
    while ($row = mysqli_fetch_assoc($resultadoPublicaciones)) {
        $publicaciones[$row['Empresa_ID']] = $row['NumPublicaciones'];
    }

    // Ahora vamos a obtener los datos de las empresas
    $queryEmpresas = "
        SELECT 
            e.ID, e.Nombre, e.Logo
        FROM empresa e
        WHERE e.ID NOT IN (
            SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'
        );
    ";

    $resultadoEmpresas = mysqli_query($conexion, $queryEmpresas);
    $empresas = [];

    while ($fila = mysqli_fetch_assoc($resultadoEmpresas)) {
        // Obtener los datos relacionados con cada empresa
        $empresaID = $fila['ID'];

        // Calcular el Score de la empresa
        $numSeguidores = isset($seguidores[$empresaID]) ? $seguidores[$empresaID] : 0;
        $totalLikes = 0;
        $totalDislikes = 0;
        $totalComentarios = 0;
        $numPublicaciones = isset($publicaciones[$empresaID]) ? $publicaciones[$empresaID] : 0; // Si no tiene publicaciones, se asigna 0

        // Sumar likes, dislikes y comentarios de las publicaciones de la empresa
        foreach ($reacciones as $publicacionID => $reaccion) {
            if (isset($comentarios[$publicacionID])) {
                $totalLikes += $reaccion['Likes'];
                $totalDislikes += $reaccion['Dislikes'];
                $totalComentarios += $comentarios[$publicacionID];
            }
        }

        // Si no tiene likes, dislikes o comentarios, asignamos 0 por defecto
        $totalLikes = $totalLikes ?: 0;
        $totalDislikes = $totalDislikes ?: 0;
        $totalComentarios = $totalComentarios ?: 0;

        // Calcular el Score (sin normalización aún)
        $scoreBruto = ($numSeguidores * 1.0) +
                    ($totalLikes * 1.0) +
                    ($totalComentarios * 1.0) -
                    ($totalDislikes * 0.5);


        // Si no tiene publicaciones, el score será 0 para evitar división por 0
        $scoreBruto = $numPublicaciones > 0 ? $scoreBruto / $numPublicaciones : 0;

        // Normalizar el scoreBruto a 0-5 directamente
        $scoreNormalized = ($scoreBruto - 0) / (100) * 5; // Esto convierte el ScoreBruto a un rango de 0 a 5.

        // Agregar la empresa con su score normalizado al array
        $empresas[] = [
            'ID' => $fila['ID'],
            'Nombre' => $fila['Nombre'],
            'Logo' => $fila['Logo'],
            'Score' => round($scoreNormalized, 2) // Normalizamos a 2 decimales
        ];
    }

    // **Ordenar las empresas por el Score de mayor a menor**
    usort($empresas, function($a, $b) {
        return $b['Score'] <=> $a['Score'];  // Ordena de mayor a menor
    });

    // **Obtener las 20 mejores empresas** (ya ordenadas)
    $empresasTop20 = array_slice($empresas, 0, 20);

    echo json_encode([
        'success' => true,
        'empresas' => $empresasTop20
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
