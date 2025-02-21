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

    if (!isset($data['idPublicacion']) || !isset($data['idCandidato'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el ID de la publicación o el ID del candidato']);
        http_response_code(400);
        exit();
    }

    // Escapar datos para evitar inyección SQL
    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    // Verificar si el usuario ya tiene una reacción en esta publicación (like o dislike)
    $consultaReaccion = "SELECT Reaccion FROM reacciones WHERE Publicacion_ID = '$idPublicacion' AND Candidato_ID = '$idCandidato' LIMIT 1";
    $resultadoReaccion = mysqli_query($conexion, $consultaReaccion);

    if ($resultadoReaccion && mysqli_num_rows($resultadoReaccion) > 0) {
        $filaReaccion = mysqli_fetch_assoc($resultadoReaccion);
        $reaccionActual = $filaReaccion['Reaccion'];

        if ($reaccionActual === 'like') {
             // Si el usuario ya tenía like, eliminarlo y agregar el dislike
             $consultaEliminarLike = "DELETE FROM reacciones WHERE Publicacion_ID = '$idPublicacion' AND Candidato_ID = '$idCandidato'";
             mysqli_query($conexion, $consultaEliminarLike);
 
             $consultaInsertarDislike = "INSERT INTO reacciones (Publicacion_ID, Candidato_ID, Reaccion, Fecha_Reaccion) 
                                      VALUES ('$idPublicacion', '$idCandidato', 'dislike', '$fechaActual')";
             if (mysqli_query($conexion, $consultaInsertarDislike)) {
                 echo json_encode(['success' => true, 'message' => 'Like eliminado y dislike agregado.']);
                 exit();
             } else {
                 echo json_encode(['success' => false, 'error' => 'Error al agregar dislike: ' . mysqli_error($conexion)]);
                 exit();
             }
        } 
    } else {
        // Si no tiene ninguna reacción, agregar el like
        $consultaInsertarLike = "INSERT INTO reacciones (Publicacion_ID, Candidato_ID, Reaccion, Fecha_Reaccion) 
                                 VALUES ('$idPublicacion', '$idCandidato', 'dislike', '$fechaActual')";
        if (mysqli_query($conexion, $consultaInsertarLike)) {
            echo json_encode(['success' => true, 'message' => 'Dislike agregado.']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al agregar disike: ' . mysqli_error($conexion)]);
        }
        exit();
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    exit();
}
?>
