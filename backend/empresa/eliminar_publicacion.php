<?php
require_once '../config/conexion.php';

// Encabezados para habilitar CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    // Obtener datos de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idPublicacion'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el ID de la Publicación.']);
        http_response_code(400);
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);



        $consulta = "DELETE FROM publicacion WHERE ID = '$idPublicacion'";


    echo json_encode(['success' => true, 'message' => 'Publicación eliminada correctamente.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
