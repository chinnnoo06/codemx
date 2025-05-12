<?php
require_once '../config/conexion.php';

header("Content-Type: application/json");

try {
    // Obtén el cuerpo de la solicitud
    $fechaActual = date('Y-m-d H:i:s');
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['session_id'])) {
        echo json_encode(['success' => false, 'error' => 'Session ID no proporcionado.']);
        exit();
    }

    $session_id = $input['session_id'];

    // Busca el ID del candidato en la tabla sesiones usando el session_id
    $consultaSesion = "
        SELECT Administrador_ID
        FROM sesiones
        WHERE Session_ID = '$session_id' AND Expira_en > '$fechaActual'
        LIMIT 1
    ";

    $resultadoSesion = mysqli_query($conexion, $consultaSesion);

    if (!$resultadoSesion) {
        echo json_encode(['success' => false, 'error' => 'Error al buscar la sesión: ' . mysqli_error($conexion)]);
        exit();
    }

    $filaSesion = mysqli_fetch_assoc($resultadoSesion);

    if (!$filaSesion || !$filaSesion['Candidato_ID']) {
        echo json_encode(['success' => false, 'error' => 'Sesión inválida o expirada.']);
        exit();
    } else {
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
