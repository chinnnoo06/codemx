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
    // Obtener los datos de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato']) || !isset($data['nuevoEstado'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el ID o estado.']);
        http_response_code(400);
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']); 
    $estado = mysqli_real_escape_string($conexion, $data['nuevoEstado']);
  
    $consulta = "UPDATE verificacion_usuarios SET Estado_Cuenta = '$estado' WHERE Candidato_ID = '$idCandidato'";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => 'Estado de cuenta editado corrctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
