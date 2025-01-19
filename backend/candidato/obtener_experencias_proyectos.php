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

    $consultaExperiencias = "SELECT * FROM experencia_laboral WHERE Candidato_ID = '$idCandidato'";
    $resultadoExperiencias = mysqli_query($conexion, $consultaExperiencias);

    if (!$resultadoExperiencias) {
        echo json_encode(['error' => 'Error en la consulta SQL de experiencias: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $listaDeExperiencias = [];

    while ($filaExperiencia = mysqli_fetch_assoc($resultadoExperiencias)) {
        $idExperiencia = $filaExperiencia['ID'];

        $consultaProyectos = "SELECT * FROM proyecto WHERE Experencia_Laboral = '$idExperiencia'";
        $resultadoProyectos = mysqli_query($conexion, $consultaProyectos);

        if (!$resultadoProyectos) {
            echo json_encode(['error' => 'Error en la consulta SQL de proyectos: ' . mysqli_error($conexion)]);
            http_response_code(500); 
            exit();
        }

        $proyectos = [];
        while ($filaProyecto = mysqli_fetch_assoc($resultadoProyectos)) {
            $proyectos[] = $filaProyecto;
        }

        $listaDeExperiencias[] = [
            'experiencia' => [
                'ID' => $filaExperiencia['ID'],
                'Empresa' => $filaExperiencia['Empresa'],
                'Duracion' => $filaExperiencia['Duracion']
            ],
            'proyectos' => array_map(function ($proyecto) {
                return [
                    'ID' => $proyecto['ID'],
                    'Nombre' => $proyecto['Nombre'],
                    'Descripcion' => $proyecto['Descripcion']
                ];
            }, $proyectos)
        ];
    }

    echo json_encode([
        'success' => true,
        'experiencias' => $listaDeExperiencias
    ]);
} else {
    // Método no permitido
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
