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

    if ((!isset($data['idPublicacion'])) || !isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID de la publicación o el ID del candidato']);
        http_response_code(400); 
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    $consultaReaccion = "SELECT Reaccion FROM reacciones WHERE Publicacion_ID = '$idPublicacion' AND Candidato_ID = '$idCandidato'";
    $resultadoReaccion = mysqli_query($conexion, $consultaReaccion);
    
    if ($resultadoReaccion && mysqli_num_rows($resultadoReaccion) > 0) {
        $filaReaccion = mysqli_fetch_assoc($resultadoReaccion);

        echo json_encode([
            'success' => true,
            'reaccion' => $filaReaccion['Reaccion']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'reaccion' => null
        ]);
    }


} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
