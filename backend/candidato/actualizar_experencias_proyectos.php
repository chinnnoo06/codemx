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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato']) || !isset($data['experiencias'])) {
        echo json_encode(['error' => 'Datos incompletos.']);
        http_response_code(400); // Bad Request
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $experiencias = $data['experiencias'];

    try {
        foreach ($experiencias as $exp) {
            // Si la experiencia tiene un ID, actualizamos
            if (isset($exp['id']) && $exp['id']) {
                $idExperiencia = mysqli_real_escape_string($conexion, $exp['id']);
                $empresa = mysqli_real_escape_string($conexion, $exp['empresa']);
                $duracion = mysqli_real_escape_string($conexion, $exp['tiempo']);

                $queryActualizarExp = "
                    UPDATE experencia_laboral 
                    SET Empresa = '$empresa', Duracion = $duracion
                    WHERE ID = $idExperiencia AND Candidato_ID = $idCandidato
                ";
                mysqli_query($conexion, $queryActualizarExp);

                // Actualizamos o agregamos proyectos
                foreach ($exp['proyectos'] as $proyecto) {
                    if (isset($proyecto['id']) && $proyecto['id']) {
                        $idProyecto = mysqli_real_escape_string($conexion, $proyecto['id']);
                        $nombre = mysqli_real_escape_string($conexion, $proyecto['nombre']);
                        $descripcion = mysqli_real_escape_string($conexion, $proyecto['descripcion']);

                        $queryActualizarProyecto = "
                            UPDATE proyecto 
                            SET Nombre = '$nombre', Descripcion = '$descripcion'
                            WHERE ID = $idProyecto AND Experencia_Laboral = $idExperiencia
                        ";
                        mysqli_query($conexion, $queryActualizarProyecto);
                    } else {
                        $nombre = mysqli_real_escape_string($conexion, $proyecto['nombre']);
                        $descripcion = mysqli_real_escape_string($conexion, $proyecto['descripcion']);

                        $queryInsertarProyecto = "
                            INSERT INTO proyecto (Experencia_Laboral, Nombre, Descripcion) 
                            VALUES ($idExperiencia, '$nombre', '$descripcion')
                        ";
                        mysqli_query($conexion, $queryInsertarProyecto);
                    }
                }
            } else {
                // Si no tiene ID, es una nueva experiencia
                $empresa = mysqli_real_escape_string($conexion, $exp['empresa']);
                $duracion = mysqli_real_escape_string($conexion, $exp['tiempo']);

                $queryInsertarExp = "
                    INSERT INTO experencia_laboral (Candidato_ID, Empresa, Duracion) 
                    VALUES ($idCandidato, '$empresa', $duracion)
                ";
                mysqli_query($conexion, $queryInsertarExp);
                $idExperiencia = mysqli_insert_id($conexion);

                // Insertamos los proyectos relacionados
                foreach ($exp['proyectos'] as $proyecto) {
                    $nombre = mysqli_real_escape_string($conexion, $proyecto['nombre']);
                    $descripcion = mysqli_real_escape_string($conexion, $proyecto['descripcion']);

                    $queryInsertarProyecto = "
                        INSERT INTO proyecto (Experencia_Laboral, Nombre, Descripcion) 
                        VALUES ($idExperiencia, '$nombre', '$descripcion')
                    ";
                    mysqli_query($conexion, $queryInsertarProyecto);
                }
            }
        }

        echo json_encode(['success' => true, 'message' => 'Experiencias y proyectos actualizados correctamente.']);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
        http_response_code(500); // Internal Server Error
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
