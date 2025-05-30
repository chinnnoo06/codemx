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
    if (!isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID del candidato.']);
        http_response_code(400); // Bad Request
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    
    $consulta = " DELETE FROM seguidores WHERE Empresa_ID = '$idEmpresa' AND Candidato_ID = '$idCandidato' ";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Siguimiento eliminado.']);
    } else {
        echo json_encode(['error' => false, 'error' => 'Error al eliminar: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
