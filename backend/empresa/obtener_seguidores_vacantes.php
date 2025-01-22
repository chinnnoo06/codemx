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

    if (!isset($data['idEmpresa'])) {
        echo json_encode(['error' => 'Falta el ID de la empresa.']);
        http_response_code(400); 
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);

    // Consulta para obtener los seguidores de la empresa
    $consultaSeguidores = "
        SELECT candidato.ID, candidato.Nombre, candidato.Apellido, candidato.Fotografia
        FROM seguidores
        INNER JOIN candidato ON seguidores.Candidato_ID = candidato.ID
        WHERE seguidores.Empresa_ID = '$idEmpresa'
    ";

    $resultadoSeguidores = mysqli_query($conexion, $consultaSeguidores);

    if (!$resultadoSeguidores) {
        echo json_encode(['error' => 'Error en la consulta SQL de seguidores: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    // Consulta para obtener el número de vacantes de la empresa
    $consultaVacantes = "
        SELECT COUNT(*) AS cantidad_vacantes
        FROM vacante
        WHERE Empresa_ID = '$idEmpresa'
    ";

    $resultadoVacantes = mysqli_query($conexion, $consultaVacantes);

    if (!$resultadoVacantes) {
        echo json_encode(['error' => 'Error en la consulta SQL de vacantes: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $vacantes = mysqli_fetch_assoc($resultadoVacantes);
    $cantidadDeVacantes = $vacantes['cantidad_vacantes'];

    if (mysqli_num_rows($resultadoSeguidores) > 0) {
        $listaDeCandidatos = [];
        while ($fila = mysqli_fetch_assoc($resultadoSeguidores)) {
            $listaDeCandidatos[] = $fila;
        }

        $cantidadDeSeguidores = count($listaDeCandidatos);

        echo json_encode([
            'cantidadSeguidores' => $cantidadDeSeguidores,
            'cantidadVacantes' => $cantidadDeVacantes,
            'seguidores' => $listaDeCandidatos
        ]);
    } else {
        echo json_encode([
            'cantidadSeguidores' => 0, 
            'cantidadVacantes' => $cantidadDeVacantes,
            'seguidores' => [],
            'error' => 'La empresa no tiene seguidores.'
        ]);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
