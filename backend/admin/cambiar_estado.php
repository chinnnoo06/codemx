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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validación de estado
    if (!isset($data['nuevoEstado'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el nuevo estado.']);
        http_response_code(400);
        exit();
    }

    $estado = mysqli_real_escape_string($conexion, $data['nuevoEstado']);

    // Determinar si se usará Candidato_ID o Empresa_ID
    if (isset($data['idCandidato'])) {
        $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
        $consulta = "UPDATE verificacion_usuarios SET Estado_Cuenta = '$estado' WHERE Candidato_ID = '$idCandidato'";
    } elseif (isset($data['idEmpresa'])) {
        $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
        $consulta = "UPDATE verificacion_usuarios SET Estado_Cuenta = '$estado' WHERE Empresa_ID = '$idEmpresa'";
    } else {
        echo json_encode(['success' => false, 'error' => 'Falta el ID de candidato o empresa.']);
        http_response_code(400);
        exit();
    }

    // Ejecutar la consulta
    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Estado de cuenta actualizado correctamente.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error en la base de datos: ' . mysqli_error($conexion)]);
        http_response_code(500);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
