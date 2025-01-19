<?php
require_once '../config/conexion.php';

// Encabezados para habilitar CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato']) || !isset($data['experiencias'])) {
        echo json_encode(['error' => 'Faltan datos obligatorios.']);
        http_response_code(400);
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $experiencias = $data['experiencias'];

    // Procesar cada experiencia
    foreach ($experiencias as $exp) {
        $idExperiencia = $exp['id'];
        $empresa = mysqli_real_escape_string($conexion, $exp['experiencia']['Empresa']);
        $duracion = (int)$exp['experiencia']['Duracion'];

        if ($idExperiencia === null) {
            // Insertar nueva experiencia
            $insertExp = "INSERT INTO experencia_laboral (Candidato_ID, Empresa, Duracion) 
                          VALUES ('$idCandidato', '$empresa', '$duracion')";
            if (!mysqli_query($conexion, $insertExp)) {
                echo json_encode(['error' => 'Error al insertar experiencia: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
            $idExperiencia = mysqli_insert_id($conexion);
        } else {
            // Actualizar experiencia existente
            $updateExp = "UPDATE experencia_laboral 
                          SET Empresa = '$empresa', Duracion = '$duracion' 
                          WHERE ID = '$idExperiencia' AND Candidato_ID = '$idCandidato'";
            if (!mysqli_query($conexion, $updateExp)) {
                echo json_encode(['error' => 'Error al actualizar experiencia: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
        }

        // Procesar proyectos de la experiencia
        $proyectosExistentes = array_map(function ($proj) {
            return $proj['id'];
        }, $exp['proyectos']);

        $consultaProyectos = "SELECT ID FROM proyecto WHERE Experencia_Laboral = '$idExperiencia'";
        $resultadoProyectos = mysqli_query($conexion, $consultaProyectos);
        $idsProyectosDB = [];
        while ($row = mysqli_fetch_assoc($resultadoProyectos)) {
            $idsProyectosDB[] = $row['ID'];
        }

        // Eliminar proyectos no enviados
        $proyectosAEliminar = array_diff($idsProyectosDB, $proyectosExistentes);
        if (count($proyectosAEliminar) > 0) {
            $idsEliminar = implode(',', $proyectosAEliminar);
            $deleteProyectos = "DELETE FROM proyecto WHERE ID IN ($idsEliminar)";
            if (!mysqli_query($conexion, $deleteProyectos)) {
                echo json_encode(['error' => 'Error al eliminar proyectos: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
        }

        // Insertar o actualizar proyectos
        foreach ($exp['proyectos'] as $proj) {
            $idProyecto = $proj['id'];
            $nombre = mysqli_real_escape_string($conexion, $proj['Nombre']);
            $descripcion = mysqli_real_escape_string($conexion, $proj['Descripcion']);

            if ($idProyecto === null) {
                // Insertar nuevo proyecto
                $insertProj = "INSERT INTO proyecto (Experencia_Laboral, Nombre, Descripcion) 
                               VALUES ('$idExperiencia', '$nombre', '$descripcion')";
                if (!mysqli_query($conexion, $insertProj)) {
                    echo json_encode(['error' => 'Error al insertar proyecto: ' . mysqli_error($conexion)]);
                    http_response_code(500);
                    exit();
                }
            } else {
                // Actualizar proyecto existente
                $updateProj = "UPDATE proyecto 
                               SET Nombre = '$nombre', Descripcion = '$descripcion' 
                               WHERE ID = '$idProyecto' AND Experencia_Laboral = '$idExperiencia'";
                if (!mysqli_query($conexion, $updateProj)) {
                    echo json_encode(['error' => 'Error al actualizar proyecto: ' . mysqli_error($conexion)]);
                    http_response_code(500);
                    exit();
                }
            }
        }
    }

    // Eliminar experiencias que no están en la solicitud
    $idsExperiencias = array_filter(array_map(function ($exp) {
        return $exp['id'];
    }, $experiencias));

    $consultaExperiencias = "SELECT ID FROM experencia_laboral WHERE Candidato_ID = '$idCandidato'";
    $resultadoExperiencias = mysqli_query($conexion, $consultaExperiencias);
    $idsExperienciasDB = [];
    while ($row = mysqli_fetch_assoc($resultadoExperiencias)) {
        $idsExperienciasDB[] = $row['ID'];
    }

    $experienciasAEliminar = array_diff($idsExperienciasDB, $idsExperiencias);
    if (count($experienciasAEliminar) > 0) {
        $idsEliminar = implode(',', $experienciasAEliminar);
        $deleteExperiencias = "DELETE FROM experencia_laboral WHERE ID IN ($idsEliminar)";
        if (!mysqli_query($conexion, $deleteExperiencias)) {
            echo json_encode(['error' => 'Error al eliminar experiencias: ' . mysqli_error($conexion)]);
            http_response_code(500);
            exit();
        }
    }

    echo json_encode(['success' => true, 'message' => 'Experiencias y proyectos actualizados correctamente.']);
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
