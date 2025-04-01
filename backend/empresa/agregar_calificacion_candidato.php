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
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idVacante']) || !isset($data['idCandidato']) || !isset($data['idEmpresa']) || !isset($data['calificacion']) || !isset($data['comentarioCalificacion'])) {
        echo json_encode(['error' => 'Faltan parámetros necesarios.']);
        http_response_code(400); // Bad Request
        exit();
    }

    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $calificacion = mysqli_real_escape_string($conexion, $data['calificacion']);
    $comentarioCalificacion = mysqli_real_escape_string($conexion, $data['comentarioCalificacion']);
    $fechaActual = date('Y-m-d H:i:s');

    // Verificamos si ya existe una calificación para esta vacante, candidato y empresa
    $consultaExistente = "SELECT * FROM calificaciones_candidato WHERE Vacante_ID = '$idVacante' AND Candidato_ID = '$idCandidato' AND Empresa_ID = '$idEmpresa'";
    $resultadoExistente = mysqli_query($conexion, $consultaExistente);

    if (mysqli_num_rows($resultadoExistente) > 0) {
        // Si ya existe una calificación, la eliminamos
        $consultaEliminar = "DELETE FROM calificaciones_candidato WHERE Vacante_ID = '$idVacante' AND Candidato_ID = '$idCandidato' AND Empresa_ID = '$idEmpresa'";
        mysqli_query($conexion, $consultaEliminar);
    }

    // Insertamos la nueva calificación
    $consultaAgregar = "INSERT INTO calificaciones_candidato (Vacante_ID, Candidato_ID, Empresa_ID, Calificacion, Comentario, Fecha_Calificacion) VALUES ('$idVacante', '$idCandidato', '$idEmpresa', '$calificacion', '$comentarioCalificacion', '$fechaActual')";

    if (mysqli_query($conexion, $consultaAgregar)) {
        echo json_encode(['success' => 'Calificación agregada correctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
