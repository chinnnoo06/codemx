<?php
require_once '../config/conexion.php';

// Configuración de CORS
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

    // Consulta para contar usuarios (candidatos)
    $consultaUsuarios = "SELECT COUNT(*) AS totalUsuarios FROM candidato";
    $resultadoUsuarios = mysqli_query($conexion, $consultaUsuarios);

    if (!$resultadoUsuarios) {
        echo json_encode(['error' => 'Error en la consulta usuarios: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }
    $filaUsuarios = mysqli_fetch_assoc($resultadoUsuarios);
    $numUsuarios = (int)$filaUsuarios['totalUsuarios'];

    // Consulta para contar empresas
    $consultaEmpresas = "SELECT COUNT(*) AS totalEmpresas FROM empresa";
    $resultadoEmpresas = mysqli_query($conexion, $consultaEmpresas);

    if (!$resultadoEmpresas) {
        echo json_encode(['error' => 'Error en la consulta empresas: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }
    $filaEmpresas = mysqli_fetch_assoc($resultadoEmpresas);
    $numEmpresas = (int)$filaEmpresas['totalEmpresas'];

    // Consulta para contar vacantes
    $consultaVacantes = "SELECT COUNT(*) AS totalVacantes FROM vacante";
    $resultadoVacantes = mysqli_query($conexion, $consultaVacantes);

    if (!$resultadoVacantes) {
        echo json_encode(['error' => 'Error en la consulta vacantes: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }
    $filaVacantes = mysqli_fetch_assoc($resultadoVacantes);
    $numVacantes = (int)$filaVacantes['totalVacantes'];

    // Responder con los totales
    echo json_encode([
        'success' => true,
        'numUsuarios' => $numUsuarios,
        'numEmpresas' => $numEmpresas,
        'numVacantes' => $numVacantes,
    ]);

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
