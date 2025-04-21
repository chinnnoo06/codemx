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

    if (!isset($data['idCandidato']) || !isset($data['candidatoNombre']) || !isset($data['candidatoApellido']) || !isset($data['nombreVacante']) || !isset($data['nombreEmpresa']) || !isset($data['idVacante'])) {
        echo json_encode(['error' => 'Faltan datos importantes']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $candidatoNombre = mysqli_real_escape_string($conexion, $data['candidatoNombre']);
    $candidatoApellido = mysqli_real_escape_string($conexion, $data['candidatoApellido']);
    $nombreVacante = mysqli_real_escape_string($conexion, $data['nombreVacante']);
    $nombreEmpresa = mysqli_real_escape_string($conexion, $data['nombreEmpresa']);
    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);
    $tipoEvento = 'postulacion';
    $descripcion = "Hola $candidatoNombre $candidatoApellido, se ha actualizado el estado de tu postulación de la vacante: $nombreVacante, de la empresa $nombreEmpresa. Te invitamos a revisar los detalles en la plataforma para conocer el nuevo estatus y los siguientes pasos.";
    $fechaCreacion = date('Y-m-d H:i:s');

    // Obtener correo del candidato
    $consultaCorreo = "SELECT Email FROM candidato WHERE ID = '$idCandidato' LIMIT 1";
    $resultadoCorreo = mysqli_query($conexion, $consultaCorreo);

    if (!$resultadoCorreo || mysqli_num_rows($resultadoCorreo) === 0) {
        throw new Exception("No se encontró el correo del candidato.");
    }

    $filaCorreo = mysqli_fetch_assoc($resultadoCorreo);
    $emailDestino = $filaCorreo['Email'];

    $consultaNotificacion = "INSERT INTO notificaciones (Candidato_ID, Tipo_Evento, Descripcion, Fecha_Creacion, Vacante_ID)
                             VALUES ('$idCandidato', '$tipoEvento', '$descripcion', '$fechaCreacion', '$idVacante')";


    if (!mysqli_query($conexion, $consultaNotificacion)) {
        throw new Exception("Error al guardar la notificación: " . mysqli_error($conexion));
    }

    
    $mail = new PHPMailer(true);
    try {
        // Configuración del servidor SMTP
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST'); 
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USERNAME'); 
        $mail->Password = getenv('SMTP_PASSWORD'); 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = getenv('SMTP_PORT');

        // Configuración del correo
        $mail->setFrom(getenv('SMTP_USERNAME'), 'CODEMX');
        $mail->addAddress($emailDestino);

        $mail->isHTML(true);
        $mail->Subject = 'ACTUALIZACION DE POSTULACION';
        $mail->Body = nl2br($descripcion);
        $mail->Body = "
            <p style='font-size: 16px;'>Hola <strong>$candidatoNombre $candidatoApellido</strong>,</p>
            <p style='font-size: 15px;'>Se ha actualizado el estado de tu postulación de la vacante: $nombreVacante, de la empresa $nombreEmpresa. Te invitamos a revisar los detalles en la plataforma para conocer el nuevo estatus y los siguientes pasos.</p>
            
            <p style='margin-top: 20px;'>
                <a href='https://www.codemx.net/codemx/frontend/build/iniciar-sesion' 
                style='display: inline-block; padding: 10px 20px; background-color: #0B1C26; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                Ir a CODEMX
                </a>
            </p>

            <p style='font-size: 13px; color: #888;'>Este correo es automático. No respondas a esta dirección.</p>
        ";

        $mail->send();
        echo json_encode(['success' => true, 'message' => 'Notificación registrada y correo enviado.']);
    } catch (Exception $e) {
        die(json_encode(['error' => 'No se pudo enviar el correo de notificacion: ' . $mail->ErrorInfo]));
    }
    
   
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
