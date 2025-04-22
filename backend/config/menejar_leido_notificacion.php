<?php
require_once '../config/conexion.php';

$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['idNotificacion']) || !isset($data['leido'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit();
}

$id = mysqli_real_escape_string($conexion, $data['idNotificacion']);
$leido = mysqli_real_escape_string($conexion, $data['leido']); // 1 o 0

$query = "UPDATE notificaciones SET Leida = '$leido' WHERE ID = '$id'";

if (mysqli_query($conexion, $query)) {
    echo json_encode(['success' => true, 'message' => 'Estado actualizado']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar estado']);
}
