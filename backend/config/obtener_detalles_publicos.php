<?php
require_once '../config/conexion.php';

// Configurar cabeceras
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $candidatoId = intval($_GET['candidato_id']);

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
                // No se encontraron detalles
                echo json_encode(['error' => 'No se encontraron detalles públicos.']);
            }
        } else {
            // Error en la consulta
            echo json_encode(['error' => 'Error en la consulta: ' . mysqli_error($conexion)]);
        }
    } else {
        // ID inválido
        echo json_encode(['error' => 'ID de candidato no válido.']);
    }
} else {
    // Método no permitido
    echo json_encode(['error' => 'Método no permitido.']);
}
