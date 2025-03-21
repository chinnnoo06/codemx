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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato']) || !isset($data['idVacante'])) {
        echo json_encode(['error' => 'Falta el ID del candidato o de la vacante.']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);

    // Consulta para verificar si la vacante está guardada
    $consulta = "SELECT COUNT(*) as count FROM vacantes_guardadas WHERE Vacante_ID = '$idVacante' AND Candidato_ID = '$idCandidato'";
    $resultado = mysqli_query($conexion, $consulta);

    if ($resultado) {
        $row = mysqli_fetch_assoc($resultado);
        // Si el resultado es mayor que 0, devuelve true, de lo contrario false
        if ($row['count'] > 0) {
            echo json_encode(true); // La vacante está guardada
        } else {
            echo json_encode(false); // La vacante no está guardada
        }
    } else {
        echo json_encode(['error' => 'Error al realizar la consulta.']);
        http_response_code(500); 
    }

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
