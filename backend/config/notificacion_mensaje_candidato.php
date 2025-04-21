<?php
require_once '../config/conexion.php';
require_once '../env_loader.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

loadEnv(__DIR__ . '/../../.env');

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

    if (!isset($data['idEmpresa']) && !isset($data['empresaNombre']) || !isset($data['candidatoNombre']) || !isset($data['candidatoApellido']) || !isset($data['idChat'])) {
        echo json_encode(['error' => 'Faltan datos importantes']);
        http_response_code(400);
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $empresaNombre = mysqli_real_escape_string($conexion, $data['empresaNombre']);
    $candidatoNombre = mysqli_real_escape_string($conexion, $data['candidatoNombre']);
    $candidatoApellido = mysqli_real_escape_string($conexion, $data['candidatoApellido']);
    $idChat = mysqli_real_escape_string($conexion, $data['idChat']);
    $tipoEvento = 'mensaje';
    $descripcion = "Hola $empresaNombre, $candidatoNombre $candidatoApellido te ha enviado nuevos mensajes. ¡No dejes pasar la oportunidad de responder y seguir avanzando en el proceso!";
    $fechaCreacion = date('Y-m-d H:i:s');
    $fechaActual = date('Y-m-d H:i:s');

    // Revisar si la empresa NO tiene sesiones activas (vigentes)
    $consultaSesion = "SELECT Session_ID FROM sesiones WHERE Empresa_ID = '$idEmpresa' AND Expira_En > '$fechaActual'";
    $resultadoSesion = mysqli_query($conexion, $consultaSesion);

    if (mysqli_num_rows($resultadoSesion) === 0) {
        // No tiene sesión activa → enviar notificación y correo

        // Obtener correo del candidato (quien envió el mensaje)
        $consultaCorreo = "SELECT Email FROM empresa WHERE ID = '$idEmpresa' LIMIT 1";
        $resultadoCorreo = mysqli_query($conexion, $consultaCorreo);

        if (!$resultadoCorreo || mysqli_num_rows($resultadoCorreo) === 0) {
            throw new Exception("No se encontró el correo de la empresa.");
        }

        $filaCorreo = mysqli_fetch_assoc($resultadoCorreo);
        $emailDestino = $filaCorreo['Email'];

        // Verificar si ya se envió una notificación recientemente (últimos 3 minutos)
        $consultaReciente = "
        SELECT ID 
        FROM notificaciones 
        WHERE Empresa_ID = '$idEmpresa' 
        AND Chat_ID = '$idChat'
        AND Tipo_Evento = 'mensaje'
        AND TIMESTAMPDIFF(MINUTE, Fecha_Creacion, '$fechaActual') < 3
        LIMIT 1
        ";

        $resultadoReciente = mysqli_query($conexion, $consultaReciente);

        if (mysqli_num_rows($resultadoReciente) > 0) {
        // Ya hay una notificación reciente, no se envía otra
        echo json_encode(['success' => true, 'message' => 'Ya existe una notificación reciente.']);
        exit();
        }


        // Insertar en la tabla de notificaciones
        $consultaNotificacion = "INSERT INTO notificaciones (Empresa_ID, Tipo_Evento, Descripcion, Fecha_Creacion, Chat_ID)
                                 VALUES ('$idEmpresa', '$tipoEvento', '$descripcion', '$fechaCreacion', '$idChat')";

        if (!mysqli_query($conexion, $consultaNotificacion)) {
            throw new Exception("Error al guardar la notificación: " . mysqli_error($conexion));
        }

        // Enviar correo
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST');
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USERNAME');
        $mail->Password = getenv('SMTP_PASSWORD');
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = getenv('SMTP_PORT');

        $mail->setFrom(getenv('SMTP_USERNAME'), 'CODEMX');
        $mail->addAddress($emailDestino);

        $mail->isHTML(true);
        $mail->Subject = 'MENSAJES NUEVOS';
        $mail->Body = "
            <p style='font-size: 16px;'>Hola <strong>$empresaNombre</strong>,</p>
            <p style='font-size: 15px;'>Has recibido nuevos mensajes de <strong>$candidatoNombre $candidatoApellido</strong>. Entra a la plataforma para responder.</p>
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
    } else {
        echo json_encode(['success' => true, 'message' => 'La empresa tiene sesión activa. No se envió correo ni notificación.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
