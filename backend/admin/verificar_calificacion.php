<?php
require_once '../config/conexion.php';
require_once '../env_loader.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

loadEnv(__DIR__ . '/../../.env');

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
        !isset($data['idSolicitud']) || 
        !isset($data['idCalificacion']) || 
        !isset($data['estado'])
    ) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos importantes']);
        http_response_code(400);
        exit();
    }

    $idSolicitud = mysqli_real_escape_string($conexion, $data['idSolicitud']);
    $idCalificacion = mysqli_real_escape_string($conexion, $data['idCalificacion']);
    $estado = mysqli_real_escape_string($conexion, $data['estado']);

    if($estado == 1) {
        $consultaDelete1 = "DELETE FROM validar_calificaciones WHERE ID = '$idSolicitud'";
        if (!mysqli_query($conexion, $consultaDelete1)) {
            throw new Exception("Error al eliminar.");
        }

        $consultaDelete2 = "DELETE FROM calificaciones_candidato WHERE ID = '$idCalificacion'";
        if (!mysqli_query($conexion, $consultaDelet2)) {
            throw new Exception("Error al eliminar calificacion.");
        }

        echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado y correo enviado correctamente.']);
    } else if ($estado == 0) {
        $consultaDelete1 = "DELETE FROM validar_calificaciones WHERE ID = '$idSolicitud'";
        if (!mysqli_query($conexion, $consultaDelete1)) {
            throw new Exception("Error al eliminar.");
        }

        echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado y correo enviado correctamente.']);
    } else {
        echo json_encode([
            'success' => false, 
            'error' => 'Error: ' . mysqli_error($conexion)
        ]);
        exit();
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    exit();
}
?>
