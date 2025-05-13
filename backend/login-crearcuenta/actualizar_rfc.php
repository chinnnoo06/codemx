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
    // Obtener los datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que los parámetros necesarios estén presentes
    if (!isset($data['userId']) || !isset($data['rfc'])) {
        echo json_encode(['error' => 'Faltan los parámetros.']);
        http_response_code(400); 
        exit();
    }

    // Sanitize inputs
    $idEmpresa = mysqli_real_escape_string($conexion, $data['userId']);
    $nuevoRfc = mysqli_real_escape_string($conexion, $data['rfc']);

    // Consulta SQL para actualizar el RFC en la base de datos
    $consulta = "
        UPDATE empresa
        SET RFC = '$nuevoRfc'
        WHERE ID = '$idEmpresa'
    ";

    // Ejecutar la consulta
    if (mysqli_query($conexion, $consulta)) {
        // Responder con éxito
        echo json_encode(['success' => true, 'message' => 'RFC actualizado correctamente.']);
    } else {
        // Si ocurre un error con la consulta
        echo json_encode(['error' => 'Error al actualizar el RFC.']);
    }

} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
