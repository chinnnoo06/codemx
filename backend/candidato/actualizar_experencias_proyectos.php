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
        echo json_encode(['error' => 'Faltan datos requeridos.']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $experiencias = $data['experiencias'];

    foreach ($experiencias as $exp) {
        $idExperiencia = $exp['id'];
        $empresa = mysqli_real_escape_string($conexion, $exp['experiencia']['Empresa']);
        $duracion = intval($exp['experiencia']['Duracion']);

        // Si no tiene ID, es una nueva experiencia
        if ($idExperiencia === null) {
            $queryInsertExperiencia = "INSERT INTO experencia_laboral (Candidato_ID, Empresa, Duracion) VALUES ('$idCandidato', '$empresa', '$duracion')";
            if (mysqli_query($conexion, $queryInsertExperiencia)) {
                $idExperiencia = mysqli_insert_id($conexion);
            } else {
                echo json_encode(['error' => 'Error al insertar experiencia: ' . mysqli_error($conexion)]);
                http_response_code(500); 
                exit();
            }
        } else {
            // Actualizar experiencia existente
            $queryUpdateExperiencia = "UPDATE experencia_laboral SET Empresa = '$empresa', Duracion = '$duracion' WHERE ID = '$idExperiencia'";
            if (!mysqli_query($conexion, $queryUpdateExperiencia)) {
                echo json_encode(['error' => 'Error al actualizar experiencia: ' . mysqli_error($conexion)]);
                http_response_code(500); 
                exit();
            }
        }

        // Manejo de proyectos asociados
        $proyectosExistentes = [];
        foreach ($exp['proyectos'] as $proj) {
            $idProyecto = $proj['id'];
            $nombre = mysqli_real_escape_string($conexion, $proj['Nombre']);
            $descripcion = mysqli_real_escape_string($conexion, $proj['Descripcion']);

            if ($idProyecto === null) {
                // Insertar nuevo proyecto
                $queryInsertProyecto = "INSERT INTO proyecto (Experencia_Laboral, Nombre, Descripcion) VALUES ('$idExperiencia', '$nombre', '$descripcion')";
                if (!mysqli_query($conexion, $queryInsertProyecto)) {
                    echo json_encode(['error' => 'Error al insertar proyecto: ' . mysqli_error($conexion)]);
                    http_response_code(500); 
                    exit();
                }
            } else {
                // Actualizar proyecto existente
                $queryUpdateProyecto = "UPDATE proyecto SET Nombre = '$nombre', Descripcion = '$descripcion' WHERE ID = '$idProyecto'";
                if (!mysqli_query($conexion, $queryUpdateProyecto)) {
                    echo json_encode(['error' => 'Error al actualizar proyecto: ' . mysqli_error($conexion)]);
                    http_response_code(500); 
                    exit();
                }
                $proyectosExistentes[] = $idProyecto;
            }
        }

        // Eliminar proyectos no incluidos
        $queryDeleteProyectos = "DELETE FROM proyecto WHERE Experencia_Laboral = '$idExperiencia' AND ID NOT IN (" . implode(',', $proyectosExistentes ?: [0]) . ")";
        if (!mysqli_query($conexion, $queryDeleteProyectos)) {
            echo json_encode(['error' => 'Error al eliminar proyectos: ' . mysqli_error($conexion)]);
            http_response_code(500); 
            exit();
        }
    }

    // Eliminar experiencias no incluidas
    $experienciasExistentes = array_filter(array_column($experiencias, 'id'));
    $queryDeleteExperiencias = "DELETE FROM experencia_laboral WHERE Candidato_ID = '$idCandidato' AND ID NOT IN (" . implode(',', $experienciasExistentes ?: [0]) . ")";
    if (!mysqli_query($conexion, $queryDeleteExperiencias)) {
        echo json_encode(['error' => 'Error al eliminar experiencias: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    echo json_encode(['success' => true, 'message' => 'Experiencias y proyectos actualizados correctamente.']);
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
