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

    // Verificar datos requeridos
    if (!isset($data['empresas']) || !isset($data['idCandidato']) || !isset($data['page'])) {
        echo json_encode(['error' => 'Faltan datos.']);
        http_response_code(400);
        exit();
    }

    $empresas = $data['empresas'];
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $page = (int)$data['page'];
    $limit = 25;
    $offset = ($page - 1) * $limit;

    // Primero obtenemos solo los IDs de empresas seguidas
    $queryEmpresasSeguidas = "SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'";
    $resultEmpresasSeguidas = mysqli_query($conexion, $queryEmpresasSeguidas);
    $empresasSeguidasIds = [];
    while ($row = mysqli_fetch_assoc($resultEmpresasSeguidas)) {
        $empresasSeguidasIds[] = $row['Empresa_ID'];
    }

    // Lista de todas las empresas (recomendadas + seguidas)
    $todasEmpresasIds = array_map(function($empresa) { return $empresa['ID']; }, $empresas);
    $empresasNoSeguidasIds = array_diff($todasEmpresasIds, $empresasSeguidasIds);

    // Consulta única optimizada con UNION para mantener el límite total
    $queryPublicaciones = "
        (SELECT p.ID, p.Empresa_ID, p.Contenido, p.Img, p.Fecha_Publicacion, p.Ocultar_MeGusta, p.Sin_Comentarios, 
                e.Logo AS Empresa_Logo, e.Nombre AS Empresa_Nombre,
                IF( EXISTS( SELECT 1 FROM reacciones WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ) 
                    OR EXISTS( SELECT 1 FROM comentarios WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ), 1, 0) AS Visto,
                0 AS es_seguida
         FROM publicacion p
         JOIN empresa e ON p.Empresa_ID = e.ID
         WHERE p.Empresa_ID IN (" . implode(',', $empresasNoSeguidasIds) . ")
         ORDER BY Visto ASC, p.Fecha_Publicacion DESC
         LIMIT $limit)
         
        UNION ALL
         
        (SELECT p.ID, p.Empresa_ID, p.Contenido, p.Img, p.Fecha_Publicacion, p.Ocultar_MeGusta, p.Sin_Comentarios, 
                e.Logo AS Empresa_Logo, e.Nombre AS Empresa_Nombre,
                IF( EXISTS( SELECT 1 FROM reacciones WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ) 
                    OR EXISTS( SELECT 1 FROM comentarios WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ), 1, 0) AS Visto,
                1 AS es_seguida
         FROM publicacion p
         JOIN empresa e ON p.Empresa_ID = e.ID
         WHERE p.Empresa_ID IN (" . implode(',', $empresasSeguidasIds) . ")
         ORDER BY Visto ASC, p.Fecha_Publicacion DESC
         LIMIT $limit)
         
        ORDER BY Visto ASC, Fecha_Publicacion DESC
        LIMIT $limit OFFSET $offset
    ";

    // Obtener publicaciones
    $resultadoPublicaciones = mysqli_query($conexion, $queryPublicaciones);
    $publicaciones = [];
    while ($row = mysqli_fetch_assoc($resultadoPublicaciones)) {
        $publicaciones[] = $row;
    }

    echo json_encode([
        'success' => true,
        'publicaciones' => $publicaciones
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>