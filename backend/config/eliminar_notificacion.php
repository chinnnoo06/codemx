<?php
require_once '../config/conexion.php';

// Encabezados para habilitar CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejo del método OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idNotificacion'])) {
        echo json_encode(['error' => 'Falta el ID de la notificacion']);
        http_response_code(400); 
        exit();
    }
    $idNotificacion = mysqli_real_escape_string($conexion, $data['idNotificacion']);

    $consulta = "DELETE FROM notificaciones WHERE ID = $idNotificacion";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Notificacion eliminada.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al eliminar: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
