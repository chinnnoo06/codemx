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

    if (!isset($data['idCandidato']) || !isset($data['idVacante'])) {
        echo json_encode(['error' => 'Faltan los parámetros idCandidato o idVacante.']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);

    // Verificamos si la vacante ya está guardada
    $consulta = "SELECT COUNT(*) as count FROM vacantes_guardadas WHERE Vacante_ID = '$idVacante' AND Candidato_ID = '$idCandidato'";
    $resultado = mysqli_query($conexion, $consulta);

    if ($resultado) {
        $row = mysqli_fetch_assoc($resultado);
        if ($row['count'] > 0) {
            // Si ya está guardada, eliminamos la vacante
            $eliminarConsulta = "DELETE FROM vacantes_guardadas WHERE Vacante_ID = '$idVacante' AND Candidato_ID = '$idCandidato'";
            $eliminarResultado = mysqli_query($conexion, $eliminarConsulta);

            if ($eliminarResultado) {
                echo json_encode(['success' => true, 'message' => 'Vacante eliminada de tus guardadas']);
            } else {
                echo json_encode(['error' => 'Error al eliminar la vacante']);
                http_response_code(500);
            }
        } else {
            // Si no está guardada, la agregamos
            $insertarConsulta = "INSERT INTO vacantes_guardadas (Vacante_ID, Candidato_ID) VALUES ('$idVacante', '$idCandidato')";
            $insertarResultado = mysqli_query($conexion, $insertarConsulta);

            if ($insertarResultado) {
                echo json_encode(['success' => true, 'message' => 'Vacante guardada correctamente']);
            } else {
                echo json_encode(['error' => 'Error al guardar la vacante']);
                http_response_code(500);
            }
        }
    } else {
        echo json_encode(['error' => 'Error al verificar el estado de la vacante']);
        http_response_code(500);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
