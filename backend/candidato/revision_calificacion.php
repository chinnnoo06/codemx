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
    http_response_code(204);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $fechaActual = date('Y-m-d H:i:s');

    if (
        !isset($data['idCalificacion']) ||
        !isset($data['descripcion'])
    ) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos importantes para realizar la denuncia.']);
        http_response_code(400);
        exit();
    }

    $idCalificacion = mysqli_real_escape_string($conexion, $data['idCalificacion']);
    $descripcion = mysqli_real_escape_string($conexion, $data['descripcion']);
    $fechaActual = date('Y-m-d H:i:s');

    // Construir consulta SQL
    $consulta = "INSERT INTO validar_calificaciones 
    (Calificacion_ID, Motivo, Fecha_Creacion)
    VALUES (
        '$idCalificacion',
        '$descripcion',
        '$fechaActual'
    )";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Denuncia agregada correctamente.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al agregar: ' . mysqli_error($conexion)]);
        http_response_code(500);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    http_response_code(500);
}
?>
