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

    if (isset($data['idCandidato'])) {
        $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
        $consulta = "DELETE FROM notificaciones WHERE Candidato_ID = $idCandidato";
    } else {
        $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
        $consulta = "DELETE FROM notificaciones WHERE Empresa_ID = $idEmpresa";
    }

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Notificaciones eliminadas.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al eliminar: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
