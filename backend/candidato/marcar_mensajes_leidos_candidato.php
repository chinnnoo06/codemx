<?php
require_once '../config/conexion.php';

$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $chatID = mysqli_real_escape_string($conexion, $data['chatID']);

    $query = "UPDATE mensajes SET Lectura = 1 WHERE Chat_ID = '$chatID' AND Usuario = 'empresa' AND Lectura = 0";
    
    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
