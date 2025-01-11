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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['email']);

    // Verificar si el correo pertenece a un candidato o empresa
    $consultaUsuario = "
        SELECT ID, 'Candidato' AS Tipo FROM Candidato WHERE Email = '$email'
        UNION
        SELECT ID, 'Empresa' AS Tipo FROM Empresa WHERE Email = '$email'
    ";
    $resultadoUsuario = mysqli_query($conexion, $consultaUsuario);

    if (mysqli_num_rows($resultadoUsuario) > 0) {
        $usuario = mysqli_fetch_assoc($resultadoUsuario);
        $userId = $usuario['ID'];
        $tipoUsuario = $usuario['Tipo'];

        // Generar un nuevo token
        $token = random_int(100000, 999999);
        $fechaExpiracion = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        // Actualizar el token en la tabla restablecer_contrasenia
        $columnaUsuario = $tipoUsuario === 'Candidato' ? 'Candidato_ID' : 'Empresa_ID';
        $actualizarToken = "
            UPDATE restablecer_contrasenia 
            SET Token = '$token', Fecha_Expiracion_Token = '$fechaExpiracion' 
            WHERE $columnaUsuario = '$userId'
        ";
        if (!mysqli_query($conexion, $actualizarToken)) {
            die(json_encode(['error' => 'Error al actualizar el token: ' . mysqli_error($conexion)]));
        }

        // Enviar el nuevo token por correo
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
            $mail->setFrom(getenv('SMTP_USERNAME'), 'Soporte');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'Reenvío de Token para Recuperación de Contraseña';
            $mail->Body = "
                <p>Hola,</p>
                <p>Tu nuevo código para restablecer tu contraseña es:</p>
                <h2>$token</h2>
                <p>Este código expira en 15 minutos.</p>
            ";

            $mail->send();
            echo json_encode(['success' => 'Token reenviado exitosamente.']);
        } catch (Exception $e) {
            die(json_encode(['error' => 'No se pudo enviar el correo: ' . $mail->ErrorInfo]));
        }
    } else {
        echo json_encode(['error' => 'El correo no está registrado']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
