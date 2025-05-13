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

    // Iniciar la transacción para asegurarse de que ambas consultas se ejecuten correctamente
    mysqli_begin_transaction($conexion);

    try {
        // Consulta para actualizar el RFC en la tabla empresa
        $consultaRFC = "
            UPDATE empresa
            SET RFC = '$nuevoRfc'
            WHERE ID = '$idEmpresa'
        ";

        // Ejecutar la consulta
        if (!mysqli_query($conexion, $consultaRFC)) {
            throw new Exception("Error al actualizar RFC en la tabla empresa.");
        }

        // Consulta para cambiar RFC_Rechazado a 0 en la tabla verificacion_usuarios
        $consultaRFCRechazado = "
            UPDATE verificacion_usuarios
            SET RFC_Rechazado = 0
            WHERE Empresa_ID = '$idEmpresa'
        ";

        // Ejecutar la consulta
        if (!mysqli_query($conexion, $consultaRFCRechazado)) {
            throw new Exception("Error al actualizar RFC_Rechazado en la tabla verificacion_usuarios.");
        }

        // Confirmar la transacción
        mysqli_commit($conexion);

        // Responder con éxito
        echo json_encode(['success' => true, 'message' => 'RFC actualizado correctamente y RFC_Rechazado restablecido.']);
    } catch (Exception $e) {

        // Responder con error
        echo json_encode(['error' => $e->getMessage()]);
    }

} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
