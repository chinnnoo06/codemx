<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato']) || !isset($data['idVacante']) || !isset($data['estadoNuevo'])) {
        echo json_encode(['error' => 'Faltan parámetros necesarios.']);
        http_response_code(400); // Bad Request
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);
    $estadoNuevo = mysqli_real_escape_string($conexion, $data['estadoNuevo']);

  
    $consulta = "UPDATE postulacion SET Estado_Candidato = '$estadoNuevo' WHERE Vacante_ID = '$idVacante' AND Candidato_ID = '$idCandidato'";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => 'Publicacion editada corrctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
