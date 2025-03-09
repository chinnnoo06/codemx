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

    if (!isset($data['idVacante'])) {
        echo json_encode(['error' => 'Falta el ID de la vacante.']);
        http_response_code(400); 
        exit();
    }

    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);

    $consultaRequesitos = "
        SELECT * FROM requisitos_vacante
        WHERE Vacante_ID = '$idvacante'
    ";

    $resultadoRequisitos = mysqli_query($conexion, $consultaRequesitos);


    if (!$resultadoRequisitos) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $consultaResponsabilidades = "
        SELECT * FROM responsabilidades_vacante
        WHERE Vacante_ID = '$idvacante'
    ";

    $resultadoResponsabilidades = mysqli_query($conexion, $consultaResponsabilidades);


    if (!$resultadoRequisitos) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }


    if (mysqli_num_rows($resultadoRequisitos) > 0) {
        $listaDeRequisitos = [];
        while ($filaRequisitos = mysqli_fetch_assoc($resultadoRequisitos)) {
            $listaDeRequisitos[] = $filaRequisitos;
        }

        echo json_encode([
            'requisitos' => $listaDeRequisitos
        ]);
    } else {
        echo json_encode(['requisitos' => [], 'error' => 'La vacante no tiene requisitos disponibles.']);
    }

    if (mysqli_num_rows($resultadoResponsabilidades) > 0) {
        $listaDeResponsabilidades = [];
        while ($filaResponsabilidades = mysqli_fetch_assoc($resultadoResponsabilidades)) {
            $listaDeResponsabilidades[] = $filaResponsabilidades;
        }

        echo json_encode([
            'responsabilidades' => $listaDeResponsabilidades
        ]);
    } else {
        echo json_encode(['responsabilidades' => [], 'error' => 'La vacante no tiene requisitos disponibles.']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>