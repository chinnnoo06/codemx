<?php
require_once '../config/conexion.php';

// Encabezados para habilitar CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['chatID'])) {
        echo json_encode(['error' => 'Falta el ID del chat.']);
        http_response_code(400);
        exit();
    }

    $chatID = mysqli_real_escape_string($conexion, $data['chatID']);

    // Obtener todos los mensajes del chat
    $queryMensajes = "
        SELECT 
            ID AS Mensaje_ID,
            Usuario,
            Mensaje,
            Fecha_Envio
        FROM mensajes
        WHERE Chat_ID = '$chatID'
        ORDER BY Fecha_Envio ASC
    ";

    $resultadoMensajes = mysqli_query($conexion, $queryMensajes);

    if (!$resultadoMensajes) {
        echo json_encode(['error' => 'Error al obtener los mensajes: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    $mensajes = [];
    while ($mensaje = mysqli_fetch_assoc($resultadoMensajes)) {
        $mensajes[] = $mensaje;
    }

    echo json_encode(['mensajes' => $mensajes]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
