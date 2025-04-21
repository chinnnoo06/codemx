<?php
require_once '../config/conexion.php';
require_once '../env_loader.php'; // Ruta al cargador de variables de entorno
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Cargar las variables de entorno desde .env
loadEnv(__DIR__ . '/../../.env');

// Verificar que las variables de entorno se cargaron
if (!getenv('SMTP_HOST')) {
    die('Error: No se pudieron cargar las variables de entorno');
}

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

    if (!isset($data['idCandidato']) && !isset($data['candidatoNombre']) || !isset($data['candidatoApellido'])) {
        echo json_encode(['error' => 'Faltan datos importantes']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $candidatoNombre = mysqli_real_escape_string($conexion, $data['candidatoNombre']);
    $candidatoApellido = mysqli_real_escape_string($conexion, $data['candidatoApellido']);
    $tipoEvento = 'postulacion';
    $descripcion = "Hola $candidatoNombre $candidatoApellido, se ha actualizado el estado de tu postulación a una vacante. Te invitamos a revisar los detalles en la plataforma para conocer el nuevo estatus y los siguientes pasos.";
    $fechaCreacion = date('Y-m-d H:i:s');

    // Obtener correo del candidato
    $consultaCorreo = "SELECT Email FROM candidato WHERE ID = '$idCandidato' LIMIT 1";
    $resultadoCorreo = mysqli_query($conexion, $consultaCorreo);

    if (!$resultadoCorreo || mysqli_num_rows($resultadoCorreo) === 0) {
        throw new Exception("No se encontró el correo del candidato.");
    }

    $filaCorreo = mysqli_fetch_assoc($resultadoCorreo);
    $emailDestino = $filaCorreo['Email'];

    $consultaNotificacion = "INSERT INTO notificaciones (Candidato_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
                             VALUES ('$idCandidato', '$tipoEvento', '$descripcion', '$fechaCreacion')";


    if (!mysqli_query($conexion, $consultaNotificacion)) {
        throw new Exception("Error al guardar la notificación: " . mysqli_error($conexion));
    }
    
    echo json_encode(['success' => true, 'message' => 'Notificación registrada y correo enviado.']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
