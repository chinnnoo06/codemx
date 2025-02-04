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
    http_response_code(204); // No Content
    exit();
}

try {
    // Obtén el cuerpo de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que el idCandidato esté presente
    if (!isset($data['idPublicacion'])) {
        echo json_encode(['error' => 'Falta el ID de la Publicacion.']);
        http_response_code(400); // Bad Request
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);

    $consulta = " DELETE FROM publicacion WHERE ID = '$idPublicacion'";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Publicacion eliminada.']);
    } else {
        echo json_encode(['error' => false, 'error' => 'Error al eliminar: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
