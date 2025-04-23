<?php
require_once '../config/conexion.php';

// Encabezados para habilitar CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato']) || !isset($data['page'])) {
        echo json_encode(['error' => 'Faltan parámetros en la solicitud.']);
        http_response_code(400);
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $page = (int)$data['page'];
    $limit = 8; // Número de notificaciones a devolver por página
    $offset = ($page - 1) * $limit; // Calcular el offset según la página

    $queryNotificaciones = "
        SELECT 
            ID,
            Tipo_Evento,
            Descripcion,
            Leida,
            Fecha_Creacion,
            Vacante_ID,
            Chat_ID,
            Publicacion_ID,
            Perfil_Empresa
        FROM notificaciones
        WHERE Candidato_ID = '$idCandidato'
        ORDER BY Fecha_Creacion DESC
        LIMIT $limit OFFSET $offset
    ";

    $resultadoNotificaciones = mysqli_query($conexion, $queryNotificaciones);

    if (!$resultadoNotificaciones) {
        echo json_encode(['error' => 'Error al obtener las notificaciones: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    $notificaciones = [];

    while ($fila = mysqli_fetch_assoc($resultadoNotificaciones)) {
        $notificaciones[] = $fila;
    }

    echo json_encode(['notificaciones' => $notificaciones]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
