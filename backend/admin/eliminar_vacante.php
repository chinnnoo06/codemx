<?php
require_once '../config/conexion.php';

// Configuración de CORS
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
    // Obtener los datos de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idVacante'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el ID de la Vacante.']);
        http_response_code(400);
        exit();
    }

    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);

    $consultaDelete = "DELETE FROM vacante WHERE ID = '$idVacante'";

    if (mysqli_query($conexion, $consultaDelete)) {
        echo json_encode([
            'success' => true, 
            'message' => 'vacante eliminada correctamente.'
        ]);
        exit();
    } else {
        echo json_encode([
            'success' => false, 
            'error' => 'Error al eliminar la vacante: ' . mysqli_error($conexion)
        ]);
        exit();
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    exit();
}
?>
