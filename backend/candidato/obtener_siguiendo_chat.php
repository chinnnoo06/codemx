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
    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);

    $consultaSiguiendo = "SELECT COUNT(*) as sigue FROM seguidores WHERE Candidato_ID = '$idCandidato' AND Empresa_ID = '$idEmpresa'";
    $resultadoSiguiendo = mysqli_query($conexion, $consultaSiguiendo);
    $filaSiguiendo = mysqli_fetch_assoc($resultadoSiguiendo);

    $consultaChat = "SELECT COUNT(*) as haychat FROM chats WHERE Candidato_ID = '$idCandidato' AND Empresa_ID = '$idEmpresa'";
    $resultadoChat= mysqli_query($conexion, $consultaChat);
    $filaChat = mysqli_fetch_assoc($resultadoChat);

    echo json_encode([
        'success' => true, 
        'sigue' => $filaSiguiendo['sigue'] > 0,
        'haychat' => $filaChat['haychat'] > 0
    ]);
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
