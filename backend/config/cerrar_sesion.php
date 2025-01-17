<?php
require_once '../config/conexion.php';

header("Content-Type: application/json");

try {
    // Obtén el cuerpo de la solicitud
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['session_id'])) {
        echo json_encode(['success' => false, 'error' => 'Session ID no proporcionado.']);
        exit();
    }

    $session_id = $input['session_id'];

    // Elimina la sesión de la tabla 'sesiones'
    $consulta = "DELETE FROM sesiones WHERE Session_ID = '$session_id'";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Sesión cerrada correctamente.']);
    } else {
        echo json_encode(['error' => false, 'error' => 'Error al eliminar la sesión: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
