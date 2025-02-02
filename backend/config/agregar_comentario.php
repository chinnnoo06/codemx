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

try {
    // Obtén el cuerpo de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);
    $fechaActual = date('Y-m-d H:i:s');

    if (!isset($data['idEmpresa']) || !isset($data['idPublicacion']) || !isset($data['comentario'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el ID de la empresa, ID del comentario o ID de la publicación.']);
        http_response_code(400);
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);
    $comentario = mysqli_real_escape_string($conexion, $data['comentario']);
    $respuestaA = isset($data['respuestaA']) && !empty($data['respuestaA']) ? mysqli_real_escape_string($conexion, $data['respuestaA']) : "NULL";

    // Consulta para insertar el nuevo comentario
    $consulta = "INSERT INTO comentarios (Publicacion_ID, Empresa_ID, Comentario, Fecha_Comentario, Respuesta_a)
                 VALUES ('$idPublicacion', '$idEmpresa', '$comentario', '$fechaActual', $respuestaA)";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Comentario agregado.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al agregar: ' . mysqli_error($conexion)]);
        http_response_code(500);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    http_response_code(500);
}
?>
