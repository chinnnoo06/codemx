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

    $responsabilidades = isset($_POST['responsabilidades']) ? json_decode($_POST['responsabilidades'], true) : [];
    $requerimientos    = isset($_POST['requerimientos']) ? json_decode($_POST['requerimientos'], true) : [];
    $tecnologias       = isset($_POST['tecnologias']) ? json_decode($_POST['tecnologias'], true) : [];

    $consulta = "INSERT INTO vacante (Empresa_ID, Titulo, Descripcion, Modalidad, Estado, Ubicacion, Fecha_Limite, Estatus, Fecha_Creacion) 
                 VALUES ('$idEmpresa', '$titulo', '$descripcion', '$modalidad', '$estado', '$ubicacion', '$fechaLimite', 'activa', '$fechaCreacion')";

    if (mysqli_query($conexion, $consulta)) {
        $vacanteId = mysqli_insert_id($conexion); // ✅ Obtener ID autoincremental

        foreach ($responsabilidades as $resp) {
            $insertResp = "INSERT INTO responsabilidades_vacante (Vacante_ID, Responsabilidad) 
                           VALUES ('$vacanteId', '$resp')";
            if (!mysqli_query($conexion, $insertResp)) {
                echo json_encode(['error' => 'Error al insertar responsabilidad: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
        }

        foreach ($requerimientos as $req) {
            $insertReq = "INSERT INTO requisitos_vacante (Vacante_ID, Requerimiento) 
                          VALUES ('$vacanteId', '$req')";
            if (!mysqli_query($conexion, $insertReq)) {
                echo json_encode(['error' => 'Error al insertar requerimiento: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
        }

        foreach ($tecnologias as $tec) {
            $insertTec = "INSERT INTO tecnologias_vacante (Tecnologia_ID, Vacante_ID) 
                          VALUES ('$tec', '$vacanteId')";
            if (!mysqli_query($conexion, $insertTec)) {
                echo json_encode(['error' => 'Error al insertar tecnología: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
        }

        echo json_encode([
            'success' => 'Vacante agregada correctamente',
            'idVacante' => $vacanteId // ✅ Devolver ID de la vacante creada
        ]);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
