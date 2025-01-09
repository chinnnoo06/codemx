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

$data = json_decode(file_get_contents('php://input'), true);
$email = mysqli_real_escape_string($conexion, $data['email']);

// Buscar el token del usuario
$consulta = "SELECT Token_Verificacion FROM verificacion_usuario INNER JOIN candidato ON verificacion_usuario.Candidato_ID = candidato.ID WHERE candidato.Email = '$email' AND Correo_Verificado = 0";
$resultado = mysqli_query($conexion, $consulta);

if (mysqli_num_rows($resultado) > 0) {
    $row = mysqli_fetch_assoc($resultado);
    $token = $row['Token_Verificacion'];

    // Enviar el correo
    $mail = new PHPMailer(true);
    try {
        // Configuración del servidor SMTP
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST'); // Cambia por tu servidor SMTP
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USERNAME'); // Cambia por tu correo
        $mail->Password = getenv('SMTP_PASSWORD'); // Cambia por tu contraseña
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = getenv('SMTP_PORT');

        // Configuración del correo
        $mail->setFrom(getenv('SMTP_USERNAME'), 'CODEMX');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = 'Reenvío de verificación';
        $mail->Body = "Hola, aquí tienes el enlace para verificar tu cuenta: <a href='https://www.codemx.net/codemx/backend/login-crearcuenta/verificar.php?token=$token'>Verificar Cuenta</a>";

        $mail->send();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'No se pudo enviar el correo: ' . $mail->ErrorInfo]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Correo no encontrado o ya verificado.']);
}
?>
