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
    if (!isset($data['nuevoEstado']) || !isset($data['tipo'])) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos.']);
        http_response_code(400);
        exit();
    }

    $estado = mysqli_real_escape_string($conexion, $data['nuevoEstado']);
    $tipo = mysqli_real_escape_string($conexion, $data['tipo']);

    if($estado == 1){
        if($tipo == "CandidatoCandidato"){
            $consulta = "UPDATE denuncias_candidato_candidato SET Estado_Denuncia = 2";
        }
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
