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

    $consultaSeguidores = "
        SELECT candidato.ID, candidato.Nombre, candidato.Apellido, candidato.Fotografia, seguidores.Fecha_Seguimiento
        FROM seguidores
        INNER JOIN candidato ON seguidores.Candidato_ID = candidato.ID
        WHERE seguidores.Empresa_ID = '$idEmpresa'
        ORDER BY seguidores.Fecha_Seguimiento DESC
    ";

    $resultadoSeguidores = mysqli_query($conexion, $consultaSeguidores);

    if (!$resultadoSeguidores) {
        echo json_encode(['error' => 'Error en la consulta SQL de seguidores: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $consultaVacantes = "
        SELECT * FROM vacante
        WHERE Empresa_ID = '$idEmpresa'
    ";

    $resultadoVacantes = mysqli_query($conexion, $consultaVacantes);

    if (!$resultadoVacantes) {
        echo json_encode(['error' => 'Error en la consulta SQL de vacantes: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    // Obtener lista de seguidores
    $listaDeCandidatos = [];
    while ($fila = mysqli_fetch_assoc($resultadoSeguidores)) {
        $listaDeCandidatos[] = $fila;
    }

    // Obtener lista de vacantes
    $listaDeVacantes = [];
    while ($filaVacante = mysqli_fetch_assoc($resultadoVacantes)) {
        $listaDeVacantes[] = $filaVacante;
    }

    // Contar seguidores y vacantes usando count()
    $cantidadDeSeguidores = count($listaDeCandidatos);
    $cantidadDeVacantes = count($listaDeVacantes);

    // Respuesta JSON con la cantidad y lista de vacantes + seguidores
    echo json_encode([
        'cantidadSeguidores' => $cantidadDeSeguidores,
        'cantidadVacantes' => $cantidadDeVacantes,
        'seguidores' => $listaDeCandidatos,
        'vacantes' => $listaDeVacantes
    ]);
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
