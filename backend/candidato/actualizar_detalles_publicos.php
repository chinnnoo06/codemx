<?php

require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $candidatoId = intval($input['candidato_id']);
    $detallesPublicos = $input['detallesPublicos'];

    if ($candidatoId > 0) {
        $consulta = "UPDATE detalles_publicos SET 
            Fecha_Nacimiento = " . ($detallesPublicos['fechaNacimiento'] ? 1 : 0) . ",
            Genero = " . ($detallesPublicos['genero'] ? 1 : 0) . ",
            Universidad = " . ($detallesPublicos['universidad'] ? 1 : 0) . ",
            Tiempo_graduacion = " . ($detallesPublicos['tiempoGraduacion'] ? 1 : 0) . ",
            Modalidad_Trabajo = " . ($detallesPublicos['modalidadTrabajo'] ? 1 : 0) . ",
            Direccion = " . ($detallesPublicos['direccion'] ? 1 : 0) . ",
            Telefono = " . ($detallesPublicos['telefono'] ? 1 : 0) . "
            WHERE Candidato_ID = $candidatoId";

        if (mysqli_query($conexion, $consulta)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Error en la actualización: ' . mysqli_error($conexion)]);
        }
    } else {
        echo json_encode(['error' => 'ID de candidato no válido.']);
    }
} else {
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
