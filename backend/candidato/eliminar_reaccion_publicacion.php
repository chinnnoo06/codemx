<?php
require_once '../config/conexion.php';

header("Access-Control-Allow-Origin: https://www.codemx.net");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idPublicacion']) || !isset($data['idCandidato'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el ID de la publicación o el ID del candidato']);
        http_response_code(400);
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    // Eliminar cualquier reacción existente (like o dislike)
    $consultaEliminarReaccion = "DELETE FROM reacciones WHERE Publicacion_ID = '$idPublicacion' AND Candidato_ID = '$idCandidato'";
    if (mysqli_query($conexion, $consultaEliminarReaccion)) {
        echo json_encode(['success' => true, 'message' => 'Reacción eliminada.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al eliminar reacción: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
