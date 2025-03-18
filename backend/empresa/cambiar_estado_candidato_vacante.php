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
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato']) || !isset($data['idVacante']) || !isset($data['estadoNuevo'])) {
        echo json_encode(['error' => 'Faltan parámetros necesarios.']);
        http_response_code(400); // Bad Request
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);
    $estadoNuevo = mysqli_real_escape_string($conexion, $data['estadoNuevo']);

  
    $consulta = "UPDATE postulaciones SET Estado_Candidato = '$estadoNuevo' WHERE Vacante_ID = '$idVacante' AND Candidato_ID = '$idCandidato'";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => 'Publicacion editada corrctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
