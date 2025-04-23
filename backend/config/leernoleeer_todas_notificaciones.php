<?php
require_once '../config/conexion.php';

// Encabezados para habilitar CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Falta el ID del candidato']);
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    // Verifica si hay notificaciones no leídas
    $consultaEstado = "SELECT COUNT(*) as total_no_leidas FROM notificaciones WHERE Candidato_ID = '$idCandidato' AND Leida = 0";
    $resultadoEstado = mysqli_query($conexion, $consultaEstado);

    if (!$resultadoEstado) {
        throw new Exception("Error al verificar estado: " . mysqli_error($conexion));
    }

    $fila = mysqli_fetch_assoc($resultadoEstado);
    $hayNoLeidas = $fila['total_no_leidas'] > 0;
    $nuevoEstado = $hayNoLeidas ? 1 : 0;

    $consultaActualizar = "UPDATE notificaciones SET Leida = '$nuevoEstado' WHERE Candidato_ID = '$idCandidato'";

    if (mysqli_query($conexion, $consultaActualizar)) {
        echo json_encode([
            'success' => true,
            'mensaje' => $nuevoEstado ? 'Todas marcadas como leídas' : 'Todas marcadas como no leídas',
            'estado' => $nuevoEstado
        ]);
    } else {
        throw new Exception("Error al actualizar: " . mysqli_error($conexion));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
