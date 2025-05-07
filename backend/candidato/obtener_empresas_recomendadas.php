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

    // Consulta de Seguidores
    $querySeguidores = "
        SELECT Empresa_ID, COUNT(*) AS Seguidores
        FROM seguidores
        GROUP BY Empresa_ID
    ";

    // Consulta de Reacciones (Likes y Dislikes)
    $queryReacciones = "
        SELECT 
            Publicacion_ID,
            COUNT(CASE WHEN Reaccion = 'like' THEN 1 END) AS TotalLikes,
            COUNT(CASE WHEN Reaccion = 'dislike' THEN 1 END) AS TotalDislikes
        FROM reacciones
        GROUP BY Publicacion_ID
    ";

    // Consulta de Comentarios
    $queryComentarios = "
        SELECT 
            Publicacion_ID,
            COUNT(*) AS TotalComentarios
        FROM comentarios
        GROUP BY Publicacion_ID
    ";

    // Consulta de Publicaciones
    $queryPublicaciones = "
        SELECT 
            Empresa_ID,
            COUNT(*) AS NumPublicaciones
        FROM publicacion
        GROUP BY Empresa_ID
    ";

    // Obtener resultados de cada consulta
    $resultadoSeguidores = mysqli_query($conexion, $querySeguidores);
    $resultadoReacciones = mysqli_query($conexion, $queryReacciones);
    $resultadoComentarios = mysqli_query($conexion, $queryComentarios);
    $resultadoPublicaciones = mysqli_query($conexion, $queryPublicaciones);

    // Inicializamos arrays para almacenar los resultados
    $seguidores = [];
    $reacciones = [];
    $comentarios = [];
    $publicaciones = [];

    while ($row = mysqli_fetch_assoc($resultadoSeguidores)) {
        $seguidores[$row['Empresa_ID']] = $row['Seguidores'];
    }

    while ($row = mysqli_fetch_assoc($resultadoReacciones)) {
        $reacciones[$row['Publicacion_ID']] = [
            'TotalLikes' => $row['TotalLikes'],
            'TotalDislikes' => $row['TotalDislikes']
        ];
    }

    while ($row = mysqli_fetch_assoc($resultadoComentarios)) {
        $comentarios[$row['Publicacion_ID']] = $row['TotalComentarios'];
    }

    while ($row = mysqli_fetch_assoc($resultadoPublicaciones)) {
        $publicaciones[$row['Empresa_ID']] = $row['NumPublicaciones'];
    }

    // Consulta para obtener las empresas y sus puntuaciones
    $queryEmpresas = "
        SELECT e.ID, e.Nombre, e.Logo
        FROM empresa e
        WHERE e.ID NOT IN (
            SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'
        )
        ORDER BY e.Nombre
        LIMIT 20;
    ";

    $resultadoEmpresas = mysqli_query($conexion, $queryEmpresas);
    $empresas = [];

    while ($fila = mysqli_fetch_assoc($resultadoEmpresas)) {
        // Calculamos el ScoreBruto para cada empresa
        $empresaID = $fila['ID'];

        // Obtenemos las métricas
        $numSeguidores = isset($seguidores[$empresaID]) ? $seguidores[$empresaID] : 0;
        $numLikes = 0;
        $numDislikes = 0;
        $numComentarios = 0;
        $numPublicaciones = isset($publicaciones[$empresaID]) ? $publicaciones[$empresaID] : 1;

        // Calculamos Likes y Dislikes sumando los resultados de las publicaciones asociadas
        foreach ($reacciones as $publicacionID => $reaction) {
            if (isset($comentarios[$publicacionID])) {
                $numLikes += $reaction['TotalLikes'];
                $numDislikes += $reaction['TotalDislikes'];
                $numComentarios += $comentarios[$publicacionID];
            }
        }

        // Calculamos el ScoreBruto
        $scoreBruto = (
            ($numSeguidores * 1.0) +
            ($numLikes * 1.5) +
            ($numComentarios * 1.2) -
            ($numDislikes * 1.3)
        ) / $numPublicaciones;

        // Normalizamos el ScoreBruto a una escala de 0 a 5
        $scores[] = $scoreBruto;
        $empresas[] = [
            'ID' => $fila['ID'],
            'Nombre' => $fila['Nombre'],
            'Logo' => $fila['Logo'],
            'ScoreBruto' => $scoreBruto
        ];
    }

    // Calcular el máximo y mínimo para la normalización
    $maxScore = max($scores);
    $minScore = min($scores);
    $rango = $maxScore - $minScore ?: 1;

    foreach ($empresas as &$empresa) {
        $empresa['Score'] = round((($empresa['ScoreBruto'] - $minScore) / $rango) * 5, 2);
    }

    echo json_encode([
        'success' => true,
        'empresas' => $empresas
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
