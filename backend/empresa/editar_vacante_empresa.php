<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idVacante = mysqli_real_escape_string($conexion, $_POST['vacante_id']);
    $titulo = mysqli_real_escape_string($conexion, $_POST['titulo']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $modalidad = mysqli_real_escape_string($conexion, $_POST['modalidad']);
    $estado = mysqli_real_escape_string($conexion, $_POST['estado']);
    $ubicacion = mysqli_real_escape_string($conexion, $_POST['ubicacion']);
    $fechaLimite = mysqli_real_escape_string($conexion, $_POST['fechaLimite']); 
    $estatus = mysqli_real_escape_string($conexion, $_POST['estatus']); 
    $fechaCreacion = date('Y-m-d H:i:s');

    // Decodificar responsabilidades y requerimientos
    $responsabilidades = isset($_POST['responsabilidades']) ? json_decode($_POST['responsabilidades'], true) : [];
    $requerimientos    = isset($_POST['requerimientos']) ? json_decode($_POST['requerimientos'], true) : [];
    $tecnologias    = isset($_POST['tecnologias']) ? json_decode($_POST['tecnologias'], true) : [];

    $consultaEliminarResponsabilidades = "DELETE FROM responsabilidades_vacante WHERE Vacante_ID = '$idVacante'";
    $consultaEliminarRequerimientos = "DELETE FROM requisitos_vacante WHERE Vacante_ID = '$idVacante'";
    $consultaEliminarTecnologias = "DELETE FROM tecnologias_vacante WHERE Vacante_ID = '$idVacante'";


    echo json_encode(['success' => 'Vacante agregada correctamente']);
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
