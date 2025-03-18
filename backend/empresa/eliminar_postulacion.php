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

try {
    // Obtén el cuerpo de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que el idCandidato esté presente
    if (!isset($data['idCandidato']) || !isset($data['idEmpresa']) || !isset($data['idVacante'])) {
        echo json_encode(['error' => 'Faltan parámetros necesarios.']);
        http_response_code(400); // Bad Request
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);

    // Consulta para verificar si existe un chat entre el candidato y la empresa
    $consultaChat = "SELECT ID FROM chats WHERE Candidato_ID = '$idCandidato' AND Empresa_ID = '$idEmpresa'";

    $resultadoChat = mysqli_query($conexion, $consultaChat);
    
    // Si existe un chat, eliminamos el chat
    if (mysqli_num_rows($resultadoChat) > 0) {
        $eliminarChat = "DELETE FROM chats WHERE Candidato_ID = '$idCandidato' AND Empresa_ID = '$idEmpresa'";

        if (!mysqli_query($conexion, $eliminarChat)) {
            echo json_encode(['error' => 'Error al eliminar el chat: ' . mysqli_error($conexion)]);
            http_response_code(500);
            exit();
        }
    }

    $consultaEliminarPostulacion = "DELETE FROM postulaciones WHERE Vacante_ID = '$idVacante' AND Candidato_ID = '$idCandidato'";

    if (mysqli_query($conexion, $consultaEliminarPostulacion)) {
        echo json_encode(['success' => true, 'message' => 'Postulación y chat eliminados.']);
    } else {
        echo json_encode(['error' => 'Error al eliminar la postulación: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
