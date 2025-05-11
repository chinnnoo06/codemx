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

    if (!isset($data['empresas']) || !isset($data['idCandidato']) || !isset($data['page'])) {
        echo json_encode(['error' => 'Faltan datos.']);
        http_response_code(400);
        exit();
    }

    $empresas = $data['empresas'];
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $page = (int)$data['page'];
    $limit = 10;
    $offset = ($page - 1) * $limit;

    // Obtener IDs de todas las empresas (seguidas + recomendadas)
    $empresasIds = array_map(function($empresa) { 
        return $empresa['ID']; 
    }, $empresas);
    
    // Consulta unificada para obtener todas las publicaciones
    $query = "
        SELECT p.ID, p.Empresa_ID, p.Contenido, p.Img, p.Fecha_Publicacion, p.Ocultar_MeGusta, p.Sin_Comentarios, 
               e.Logo AS Empresa_Logo, e.Nombre AS Empresa_Nombre,
               IF( EXISTS( SELECT 1 FROM reacciones WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ) 
                   OR EXISTS( SELECT 1 FROM comentarios WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ), 1, 0) AS Visto,
               EXISTS( SELECT 1 FROM seguidores WHERE Empresa_ID = p.Empresa_ID AND Candidato_ID = '$idCandidato' ) AS EsSeguida
        FROM publicacion p
        JOIN empresa e ON p.Empresa_ID = e.ID
        WHERE p.Empresa_ID IN (
            -- Empresas que el usuario sigue
            SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'
            
            UNION
            
            -- Empresas recomendadas
            SELECT ID FROM empresa WHERE ID IN (" . implode(',', $empresasIds) . ")
        )
        ORDER BY Visto ASC, Fecha_Publicacion DESC
        LIMIT $limit OFFSET $offset
    ";

    $resultado = mysqli_query($conexion, $query);
    $publicaciones = [];
    while ($row = mysqli_fetch_assoc($resultado)) {
        $publicaciones[] = $row;
    }

    // Verificar si hay más publicaciones
    $queryCount = "SELECT COUNT(*) as total FROM publicacion p 
                  WHERE p.Empresa_ID IN (
                      SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'
                      UNION
                      SELECT ID FROM empresa WHERE ID IN (" . implode(',', $empresasIds) . ")
                  )";
    $resultCount = mysqli_query($conexion, $queryCount);
    $total = mysqli_fetch_assoc($resultCount)['total'];
    $hasMore = ($offset + $limit) < $total;

    echo json_encode([
        'success' => true,
        'publicaciones' => $publicaciones,
        'hasMore' => $hasMore
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>