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
    $fechaActual = date('Y-m-d H:i:s');

    if ((!isset($data['idPublicacion'])) || !isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID de la publicación o el ID del candidato']);
        http_response_code(400); 
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $fechaActual = date('Y-m-d H:i:s');

    // Verificar si el usuario ya dio like en esta publicación
    $consultaReaccion = "SELECT Reaccion FROM reacciones WHERE Publicacion_ID = '$idPublicacion' AND Candidato_ID = '$idCandidato' AND Reaccion = 'like'";
    $resultadoReaccion = mysqli_query($conexion, $consultaReaccion);

    if ($resultadoReaccion && mysqli_num_rows($resultadoReaccion) > 0) {
        // Si el usuario ya dio like, eliminar el like antes de agregar el dislike
        $consultaEliminarLike = "DELETE FROM reacciones WHERE Publicacion_ID = '$idPublicacion' AND Candidato_ID = '$idCandidato'";
        mysqli_query($conexion, $consultaEliminarLike);
    }

    // Verificar si el usuario ya dio dislike previamente
    $consultaVerificarDislike = "SELECT Reaccion FROM reacciones WHERE Publicacion_ID = '$idPublicacion' AND Candidato_ID = '$idCandidato' AND Reaccion = 'dislike'";
    $resultadoVerificarDislike = mysqli_query($conexion, $consultaVerificarDislike);

    if ($resultadoVerificarDislike && mysqli_num_rows($resultadoVerificarDislike) > 0) {
        // Si ya dio dislike, eliminarlo
        $consultaEliminarDislike = "DELETE FROM reacciones WHERE Publicacion_ID = '$idPublicacion' AND Candidato_ID = '$idCandidato' AND Reaccion = 'dislike'";
        if (mysqli_query($conexion, $consultaEliminarLike)) {
            echo json_encode(['success' => true, 'message' => 'Dislike eliminado.']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al eliminar dislike: ' . mysqli_error($conexion)]);
        }
    } else {
        // Insertar el nuevo dislike
        $consultaInsertarDisike = "INSERT INTO reacciones (Publicacion_ID, Candidato_ID, Reaccion, Fecha_Reaccion) 
                                VALUES ('$idPublicacion', '$idCandidato', 'dislike', '$fechaActual')";

        if (mysqli_query($conexion, $consultaInsertarDislike)) {
            echo json_encode(['success' => true, 'message' => 'Dislike agregado.']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al agregar dislike: ' . mysqli_error($conexion)]);
        }
    }


} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
