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

    // Verificar que las empresas fueron enviadas
    if (!isset($data['empresas']) || !isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Faltan empresas o idCandidato.']);
        http_response_code(400);
        exit();
    }

    $empresas = $data['empresas']; // Empresas a obtener las publicaciones
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    // Consultas separadas para obtener las publicaciones de las empresas que sigue el candidato
    $queryPublicacionesSeguidas = "
        SELECT p.ID, p.Empresa_ID, p.Contenido, p.Fecha_Publicacion, e.Logo AS Empresa_Logo, e.Nombre AS Empresa_Nombre
        FROM publicacion p
        JOIN empresa e ON p.Empresa_ID = e.ID
        WHERE p.Empresa_ID IN (
            SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'
        )
        ORDER BY p.Fecha_Publicacion DESC
    ";

    // Consultas para obtener las publicaciones de las empresas que NO sigue el candidato
    $queryPublicacionesNoSeguidas = "
        SELECT p.ID, p.Empresa_ID, p.Contenido, p.Fecha_Publicacion, e.Logo AS Empresa_Logo, e.Nombre AS Empresa_Nombre
        FROM publicacion p
        JOIN empresa e ON p.Empresa_ID = e.ID
        WHERE p.Empresa_ID IN (" . implode(',', $empresas) . ") AND p.Empresa_ID NOT IN (
            SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'
        )
        ORDER BY p.Fecha_Publicacion DESC
    ";

    // Ejecutar las consultas para obtener publicaciones de empresas seguidas
    $resultadoSeguidas = mysqli_query($conexion, $queryPublicacionesSeguidas);
    $publicacionesSeguidas = [];
    while ($row = mysqli_fetch_assoc($resultadoSeguidas)) {
        $publicacionesSeguidas[] = $row;
    }

    // Ejecutar las consultas para obtener publicaciones de empresas no seguidas
    $resultadoNoSeguidas = mysqli_query($conexion, $queryPublicacionesNoSeguidas);
    $publicacionesNoSeguidas = [];
    while ($row = mysqli_fetch_assoc($resultadoNoSeguidas)) {
        $publicacionesNoSeguidas[] = $row;
    }

    // Combinar ambas listasz
    $publicaciones = array_merge($publicacionesSeguidas, $publicacionesNoSeguidas);

    // Si no hay publicaciones
    if (count($publicaciones) === 0) {
        echo json_encode([
            'success' => true,
            'publicaciones' => []
        ]);
        exit();
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
