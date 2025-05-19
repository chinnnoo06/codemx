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
    // Obtener los datos de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    if (
        !isset($data['idVacante']) || 
        !isset($data['nombreEmpresa']) || 
        !isset($data['nombreVacante']) || 
        !isset($data['emailEmpresa']) || 
        !isset($data['idEmpresa'])
    ) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos importantes']);
        http_response_code(400);
        exit();
    }

    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);
    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $nombreEmpresa = mysqli_real_escape_string($conexion, $data['nombreEmpresa']);
    $nombreVacante = mysqli_real_escape_string($conexion, $data['nombreVacante']);
    $emailDestino = mysqli_real_escape_string($conexion, $data['emailEmpresa']);
    $tipoEvento = 'eliminacion_contenido';
    $fechaCreacion = date('Y-m-d H:i:s');

    $consultaDelete = "DELETE FROM vacante WHERE ID = '$idVacante'";

    if (mysqli_query($conexion, $consultaDelete)) {
          // Insertar notificación
        $descripcion = "¡Hola $nombreEmpresa! Queremos informarte que tu vacante '$nombreVacante' ha sido eliminada ya que infringe las normativas de la plataforma.";

        $stmt = $conexion->prepare("
            INSERT INTO notificaciones (
                Empresa_ID, 
                Tipo_Evento, 
                Descripcion, 
                Fecha_Creacion
            ) VALUES (?, ?, ?, ?)
        ");

        $stmt->bind_param("isss", $idEmpresa, $tipoEvento, $descripcion, $fechaCreacion);

        if (!$stmt->execute()) {
            echo json_encode(['success' => false, 'error' => 'Error al registrar la notificación: ' . $stmt->error]);
            exit();
        }


        echo json_encode([
            'success' => true, 
            'message' => 'vacante eliminada correctamente.'
        ]);
        exit();
    } else {
        echo json_encode([
            'success' => false, 
            'error' => 'Error al eliminar la vacante: ' . mysqli_error($conexion)
        ]);
        exit();
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    exit();
}
?>
