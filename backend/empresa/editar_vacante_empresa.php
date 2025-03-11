<?php
require_once '../config/conexion.php';

header('Content-Type: application/json');

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

    $consulta = "
        UPDATE vacante
        SET 
            Titulo = '$titulo',
            Descripcion = '$descripcion',
            Modalidad = '$modalidad',
            Estado = '$estado',
            Ubicacion = '$ubicacion',
            Fecha_Limite = '$fechaLimite',
            Estatus = '$estatus'
        WHERE ID = '$idVacante'";

    if (mysqli_query($conexion, $consulta)) {
        $vacanteId = $idVacante;

        
        // Insertar las nuevas experiencias y sus proyectos
        foreach ($responsabilidades as $resp) {
            // Insertar experiencia
            $insertResp = "INSERT INTO responsabilidades_vacante (Vacante_ID, Responsabilidad) 
                            VALUES ('$vacanteId', '$resp')";
            if (!mysqli_query($conexion, $insertResp)) {
                echo json_encode(['error' => 'Error al insertar responsabilidad: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
        }

        foreach ($requerimientos as $req) {
            // Insertar experiencia
            $insertReq = "INSERT INTO requisitos_vacante (Vacante_ID, Requerimiento) 
                            VALUES ('$vacanteId', '$req')";
            if (!mysqli_query($conexion, $insertReq)) {
                echo json_encode(['error' => 'Error al insertar requerimientos: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
        }

        foreach ($tecnologias as $tec) {
            // Insertar tecnologias
            $insertTec = "INSERT INTO tecnologias_vacante (Tecnologia_ID, Vacante_ID) 
                            VALUES ('$tec', '$vacanteId')";
            if (!mysqli_query($conexion, $insertTec)) {
                echo json_encode(['error' => 'Error al insertar tecnologia: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
        }

        echo json_encode(['success' => 'Vacante agregada correctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>