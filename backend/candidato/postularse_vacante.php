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
    $fechaActual = date('Y-m-d H:i:s');
    
    if (!isset($data['idCandidato']) || !isset($data['idVacante'])) {
        echo json_encode(['error' => 'Falta el ID del candidato o de la vacante.']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);


   // Si no está guardada, la agregamos
   $insertarConsulta = "INSERT INTO postulaciones (Vacante_ID, Candidato_ID, Estado_Candidato, Fecha_Postulacion) VALUES ('$idVacante', '$idCandidato', 1, '$fechaActual')";
   $insertarResultado = mysqli_query($conexion, $insertarConsulta);

   if ($insertarResultado) {
       echo json_encode(['success' => true, 'message' => 'Postulacion agregada correctamente']);
   } else {
       echo json_encode(['error' => 'Error al agregar la postulacion']);
       http_response_code(500);
   }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    exit();
}
?>
