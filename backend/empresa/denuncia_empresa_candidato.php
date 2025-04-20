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
        !isset($data['idDenunciante']) ||
        !isset($data['idDenunciado']) ||
        !isset($data['motivo']) ||
        !isset($data['descripcion'])
    ) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos importantes para realizar la denuncia.']);
        http_response_code(400);
        exit();
    }

    $idDenunciante = mysqli_real_escape_string($conexion, $data['idDenunciante']);
    $idDenunciado  = mysqli_real_escape_string($conexion, $data['idDenunciado']);
    $idMotivo      = mysqli_real_escape_string($conexion, $data['motivo']);
    $descripcion   = mysqli_real_escape_string($conexion, $data['descripcion']);
    $estado        = 1;

    // Validación cruzada: si uno viene, el otro debe ir NULL
    $idComentario = "NULL";
    $idMensaje = "NULL";

    if (!empty($data['idComentario']) && empty($data['idMensaje'])) {
        $idComentario = "'" . mysqli_real_escape_string($conexion, $data['idComentario']) . "'";
    } elseif (!empty($data['idMensaje']) && empty($data['idComentario'])) {
        $idMensaje = "'" . mysqli_real_escape_string($conexion, $data['idMensaje']) . "'";
    }

    // Construir consulta SQL
    $consulta = "INSERT INTO denuncia_empresa_candidato 
    (Denunciante_ID, Denunciado_ID, Motivo, Estado_Denuncia, Descripcion, Fecha_Denuncia, Comentario_ID, Mensaje_ID)
    VALUES (
        '$idDenunciante',
        '$idDenunciado',
        '$idMotivo',
        '$estado',
        '$descripcion',
        '$fechaActual',
        $idComentario,
        $idMensaje
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
