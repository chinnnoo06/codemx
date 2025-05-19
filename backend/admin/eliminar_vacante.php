<?php
require_once '../config/conexion.php';
require_once '../env_loader.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Cargar variables de entorno
loadEnv(__DIR__ . '/../../.env');

if (!getenv('SMTP_HOST')) {
    die('Error: No se pudieron cargar las variables de entorno');
}

// Encabezados CORS
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

    // Eliminar vacante
    $consultaDelete = "DELETE FROM vacante WHERE ID = '$idVacante'";
    if (!mysqli_query($conexion, $consultaDelete)) {
        echo json_encode(['success' => false, 'error' => 'Error al eliminar la vacante: ' . mysqli_error($conexion)]);
        exit();
    }




    echo json_encode(['success' => true, 'message' => 'Vacante eliminada correctamente.']);
    exit();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    exit();
}
