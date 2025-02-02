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

try {
    // Obtén el cuerpo de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);
    $fechaActual = date('Y-m-d H:i:s');

    if (!isset($data['idEmpresa']) || !isset($data['idPublicacion']) || !isset($data['comentario'])) {
        echo json_encode(['error' => 'Falta el ID de la empresa o ID del comentario.']);
        http_response_code(400);
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);
    $comentario = mysqli_real_escape_string($conexion, $data['comentario']);

    $consulta = " INSERT INTO comentarios (Publicacion_ID, Empresa_ID, Comentario, Fecha_Reaccion)
    VALUES ('$idPublicacion', '$idEmpresa', '$comentario', '$fechaActual')";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Comentario agregado.']);
    } else {
        echo json_encode(['error' => false, 'error' => 'Error al agregar: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
