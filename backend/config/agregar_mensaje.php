<?php
require_once '../config/conexion.php'; // Incluye la configuración de la base de datos

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

// Procesar la solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar si los parámetros necesarios están presentes
    if (!isset($data['chatID']) || !isset($data['usuario']) || !isset($data['mensaje'])) {
        echo json_encode(['error' => 'Faltan parámetros necesarios.']);
        http_response_code(400);
        exit();
    }

    $chatID = mysqli_real_escape_string($conexion, $data['chatID']);
    $usuario = mysqli_real_escape_string($conexion, $data['usuario']);
    $mensaje = mysqli_real_escape_string($conexion, $data['mensaje']);
    $fechaEnvio = date('Y-m-d H:i:s'); // Fecha y hora actual

    // Consulta SQL para insertar el nuevo mensaje en la base de datos
    $consulta = "INSERT INTO mensajes (Chat_ID, Usuario, Mensaje, Fecha_Envio)
                 VALUES ('$chatID', '$usuario', '$mensaje', '$fechaEnvio')";

    // Ejecutar la consulta
    if (mysqli_query($conexion, $consulta)) {
        // Responder con éxito y devolver el mensaje guardado
        echo json_encode(['success' => true, 'Mensaje' => $mensaje, 'Fecha_Envio' => $fechaEnvio]);
    } else {
        echo json_encode(['error' => 'Error al enviar el mensaje: ' . mysqli_error($conexion)]);
        http_response_code(500);
    }

} else {
    // Responder si no es un POST
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
