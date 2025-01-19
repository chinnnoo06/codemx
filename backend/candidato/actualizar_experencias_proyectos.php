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

    if (!isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID del candidato.']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $experiencias = $data['experiencias'];

    $consultaEliminarExperiencias = "DELETE FROM experencia_laboral WHERE Candidato_ID = '$idCandidato'";
    $resultadoEliminarExperiencias = mysqli_query($conexion, $consultaEliminarExperiencias);

    if (!$resultadoEliminarExperiencias) {
        echo json_encode(['error' => 'Error en la consulta SQL de eliminar experiencias: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    // Insertar las nuevas experiencias y sus proyectos
    foreach ($experiencias as $exp) {
        $empresa = mysqli_real_escape_string($conexion, $exp['empresa']);
        $duracion = (int)$exp['tiempo'];

        // Insertar experiencia
        $insertExp = "INSERT INTO experencia_laboral (Candidato_ID, Empresa, Duracion) 
                        VALUES ('$idCandidato', '$empresa', '$duracion')";
        if (!mysqli_query($conexion, $insertExp)) {
            echo json_encode(['error' => 'Error al insertar experiencia: ' . mysqli_error($conexion)]);
            http_response_code(500);
            exit();
        }

        $idExperiencia = mysqli_insert_id($conexion);

        // Insertar proyectos de la experiencia
        foreach ($exp['proyectos'] as $proj) {
            $nombre = mysqli_real_escape_string($conexion, $proj['nombre']);
            $descripcion = mysqli_real_escape_string($conexion, $proj['descripcion']);

            $insertProj = "INSERT INTO proyecto (Experencia_Laboral, Nombre, Descripcion) 
                            VALUES ('$idExperiencia', '$nombre', '$descripcion')";
            if (!mysqli_query($conexion, $insertProj)) {
                echo json_encode(['error' => 'Error al insertar proyecto: ' . mysqli_error($conexion)]);
                http_response_code(500);
                exit();
            }
        }
    }

    echo json_encode(['success' => true, 'message' => 'Experiencias y proyectos actualizados correctamente.']);
    

} else {
    // Método no permitido
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
