<?php
require_once '../config/conexion.php';
require_once '../env_loader.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Cargar las variables de entorno desde .env
loadEnv(__DIR__ . '/../../.env');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = file_get_contents('php://input'); 

    // Validar el correo electrónico
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Correo electrónico inválido']);
        exit;
    }

    // Verificar si el correo existe en la base de datos
    $consulta = "SELECT Candidato_ID, Token_Verificacion FROM verificacion_usuarios WHERE Correo_Verificado = 0 AND Candidato_ID = (SELECT Candidato_ID FROM candidato WHERE Email = '$email')";
    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado || mysqli_num_rows($resultado) === 0) {
        echo json_encode(['success' => false, 'error' => 'El correo no está registrado o ya fue verificado.']);
        exit;
    }

    $fila = mysqli_fetch_assoc($resultado);
    $token = $fila['Token_Verificacion'];

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
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = 'REENVIO DE TOKEN PARA VERIFICAR CUENTA';
        $mail->Body = "Hola, por favor verifica tu cuenta haciendo clic en el siguiente enlace: <a href='https://www.codemx.net/codemx/backend/login-crearcuenta/verificar_correo.php?token=$token'>Verificar Cuenta</a>";

        $mail->send();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'No se pudo reenviar el correo: ' . $mail->ErrorInfo]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
