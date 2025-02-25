<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idEmpresa = mysqli_real_escape_string($conexion, $_POST['empresa_id']);
    $titulo = mysqli_real_escape_string($conexion, $_POST['titulo']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $modalidad = mysqli_real_escape_string($conexion, $_POST['modalidad']);
    $estado = mysqli_real_escape_string($conexion, $_POST['estado']);
    $ubicacion = mysqli_real_escape_string($conexion, $_POST['ubicacion']);
    $fechaLimite = mysqli_real_escape_string($conexion, $_POST['fecha_limite']);
    $estatus = mysqli_real_escape_string($conexion, $_POST['estatus']);
    $fechaCreacion = date('Y-m-d H:i:s');

    $consulta = "INSERT INTO vacante (Empresa_ID, Titulo, Descripcion, Modalidad, Estado, Ubicacion, Fecha_Limite, Estatus, Fecha_Creacion) 
        VALUES ('$idEmpresa', '$titulo', '$descripcion', '$modalidad', '$estado', '$ubicacion', '$fechaLimite', '$estatus', '$fechaCreacion')";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => 'Vacante agregada correctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>