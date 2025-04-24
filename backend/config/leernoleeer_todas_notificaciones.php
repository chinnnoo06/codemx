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

    $idCandidato = isset($data['idCandidato']) ? mysqli_real_escape_string($conexion, $data['idCandidato']) : null;
    $idEmpresa = isset($data['idEmpresa']) ? mysqli_real_escape_string($conexion, $data['idEmpresa']) : null;

    if (!$idCandidato && !$idEmpresa) {
        throw new Exception("No se proporcionó ni idCandidato ni idEmpresa.");
    }

    // Determinar el tipo de usuario y construir la consulta correspondiente
    if ($idCandidato) {
        $consultaEstado = "SELECT COUNT(*) as total_no_leidas FROM notificaciones WHERE Candidato_ID = '$idCandidato' AND Leida = 0";
    } else {
        $consultaEstado = "SELECT COUNT(*) as total_no_leidas FROM notificaciones WHERE Empresa_ID = '$idEmpresa' AND Leida = 0";
    }

    $resultadoEstado = mysqli_query($conexion, $consultaEstado);

    if (!$resultadoEstado) {
        throw new Exception("Error al verificar estado: " . mysqli_error($conexion));
    }

    $fila = mysqli_fetch_assoc($resultadoEstado);
    $hayNoLeidas = $fila['total_no_leidas'] > 0;
    $nuevoEstado = $hayNoLeidas ? 1 : 0;

    if ($idCandidato) {
        $consultaActualizar = "UPDATE notificaciones SET Leida = '$nuevoEstado' WHERE Candidato_ID = '$idCandidato'";
    } else {
        $consultaActualizar = "UPDATE notificaciones SET Leida = '$nuevoEstado' WHERE Empresa_ID = '$idEmpresa'";
    }

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
