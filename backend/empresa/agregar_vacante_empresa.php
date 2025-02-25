<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idEmpresa = mysqli_real_escape_string($conexion, $_POST['empresa_id']);
    $titulo = mysqli_real_escape_string($conexion, $_POST['titulo']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $modalidad = mysqli_real_escape_string($conexion, $_POST['modalidad']);
    $estado = mysqli_real_escape_string($conexion, $_POST['estado']);
    $ubicacion = mysqli_real_escape_string($conexion, $_POST['ubicacion']);
    $fechaLimite = mysqli_real_escape_string($conexion, $_POST['fechaLimite']); 
    $fechaCreacion = date('Y-m-d H:i:s');

    // Decodificar responsabilidades y requerimientos
    $responsabilidades = isset($_POST['responsabilidades']) ? json_decode($_POST['responsabilidades'], true) : [];
    $requerimientos    = isset($_POST['requerimientos']) ? json_decode($_POST['requerimientos'], true) : [];

    $consulta = "INSERT INTO vacante (Empresa_ID, Titulo, Descripcion, Modalidad, Estado, Ubicacion, Fecha_Limite, Estatus, Fecha_Creacion) 
                 VALUES ('$idEmpresa', '$titulo', '$descripcion', '$modalidad', '$estado', '$ubicacion', '$fechaLimite', 'activa', '$fechaCreacion')";

    if (mysqli_query($conexion, $consulta)) {
        // Aquí puedes insertar en tablas relacionadas las responsabilidades y requerimientos si lo deseas.
        echo json_encode(['success' => 'Vacante agregada correctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
