<?php

require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $candidatoId = intval($_GET['candidato_id']);

    // Verificar que se recibió un ID válido
    if ($candidatoId > 0) {
        $consulta = "SELECT * FROM detalles_publicos WHERE Candidato_ID = $candidatoId";
        $resultado = mysqli_query($conexion, $consulta);

        if ($resultado) {
            $detalles = mysqli_fetch_assoc($resultado);

            if ($detalles) {
                echo json_encode([
                    'fechaNacimiento' => (bool) $detalles['Fecha_Nacimiento'],
                    'genero' => (bool) $detalles['Genero'],
                    'universidad' => (bool) $detalles['Universidad'],
                    'tiempoGraduacion' => (bool) $detalles['Tiempo_graduacion'],
                    'modalidadTrabajo' => (bool) $detalles['Modalidad_Trabajo'],
                    'direccion' => (bool) $detalles['Direccion'],
                    'telefono' => (bool) $detalles['Telefono'],
                ]);
            } else {
                echo json_encode(['error' => 'No se encontraron detalles públicos.']);
            }
        } else {
            echo json_encode(['error' => 'Error en la consulta: ' . mysqli_error($conexion)]);
        }
    } else {
        echo json_encode(['error' => 'ID de candidato no válido.']);
    }
} else {
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
