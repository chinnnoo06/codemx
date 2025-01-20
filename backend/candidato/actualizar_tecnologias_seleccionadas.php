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

    if (!isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID del candidato.']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $tecnologiasSeleccionadas = $data['tecnologiasSeleccionadas'];

    $consultaEliminarTecnologias = "DELETE FROM tecnologias_dominadas WHERE Candidato_ID = '$idCandidato'";
    $resultadoEliminarTecnologias = mysqli_query($conexion, $consultaEliminarTecnologias);

    if (!$resultadoEliminarTecnologias) {
        echo json_encode(['error' => 'Error en la consulta SQL de eliminar tecnologias dominadas: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    // Insertar nuevas tecnologías dominadas
    foreach ($tecnologiasSeleccionadas as $idtecnologia) {
        $idtecnologia = mysqli_real_escape_string($conexion, $idtecnologia);

        $insertTec = "
            INSERT INTO tecnologias_dominadas (Candidato_ID, Tecnologia) 
            VALUES ('$idCandidato', '$idtecnologia')
        ";

        if (!mysqli_query($conexion, $insertTec)) {
            throw new Exception('Error al insertar tecnologías: ' . mysqli_error($conexion));
        }
    }

    echo json_encode(['success' => true, 'message' => 'Tecnologias actualizadas correctamente.']);
    

} else {
    // Método no permitido
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
