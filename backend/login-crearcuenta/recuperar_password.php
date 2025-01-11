<?php
require_once '../config/conexion.php'; 
require_once '../env_loader.php'; 
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Cargar variables de entorno
loadEnv(__DIR__ . '/../../.env');

if (!getenv('SMTP_HOST')) {
    die('Error: Variables de entorno no cargadas');
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = file_get_contents('php://input'); 

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'error' => 'Correo electrónico inválido']);
            exit;
        }

        // Verificar si el correo existe en la tabla Candidato
        $consultaCandidato = "SELECT ID FROM candidato WHERE Email = '$email'";
        $resultadoCandidato = mysqli_query($conexion, $consultaCandidato);

        if (mysqli_num_rows($resultadoCandidato) > 0) {
            $usuario = mysqli_fetch_assoc($resultadoCandidato);
            $userId = $usuario['ID'];
            $tipoUsuario = 'Candidato'; // Tipo de usuario identificado
        } else {
            // Si no es un candidato, verificar en la tabla Empresa
            $consultaEmpresa = "SELECT ID FROM empresa WHERE Email = '$email'";
            $resultadoEmpresa = mysqli_query($conexion, $consultaEmpresa);

            if (mysqli_num_rows($resultadoEmpresa) > 0) {
                $usuario = mysqli_fetch_assoc($resultadoEmpresa);
                $userId = $usuario['ID'];
                $tipoUsuario = 'Empresa'; // Tipo de usuario identificado
            } else {
                echo json_encode(['error' => 'El correo no está registrado']);
                exit;
            }
        }

        $token = random_int(100000, 999999); // Token de 6 dígitos
        $fechaExpiracion = date('Y-m-d H:i:s', strtotime('+1 hour')); // Expira en 1 hora // Expira en 15 minutos

        // Guardar el token en la tabla restablecer_contrasenia
        $columnaUsuario = $tipoUsuario === 'Candidato' ? 'Candidato_ID' : 'Empresa_ID';
        $insertarToken = "INSERT INTO restablecer_contrasenia ($columnaUsuario, Token, Fecha_Expiracion_Token) 
                          VALUES ('$userId', '$token', '$fechaExpiracion')";
        if (!mysqli_query($conexion, $insertarToken)) {
            throw new Exception('Error al guardar el token: ' . mysqli_error($conexion));
        }

        // Enviar correo electrónico con el token
        $mail = new PHPMailer(true);
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
        $mail->Subject = 'Recuperacion de Contraseña';
        $mail->Body = "
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña. Usa el siguiente código para continuar con el proceso:</p>
            <h2>$token</h2>
            <p>Este código expira en 15 minutos.</p>
            <p>Si no solicitaste esto, ignora este mensaje.</p>
        ";

        $mail->send();
        echo json_encode(['success' => 'Correo enviado exitosamente.']);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
