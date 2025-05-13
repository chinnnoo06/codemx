<?php
require_once '../config/conexion.php';
require_once '../env_loader.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $fechaActual = date('Y-m-d H:i:s');

    if (!isset($data['idEmpresa']) || !isset($data['empresaNombre']) || !isset($data['email'])) {
        echo json_encode(['error' => 'Faltan los parámetros.']);
        http_response_code(400); 
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $empresaNombre = mysqli_real_escape_string($conexion, $data['empresaNombre']);
    $emailDestino = mysqli_real_escape_string($conexion, $data['email']);

    // Actualizamos el campo RFC_Verificado a 1 para la empresa proporcionada
    $consulta = "UPDATE verificacion_usuarios SET RFC_Verificado = 1, Fecha_Actualizacion = '$fechaActual' WHERE Empresa_ID = '$idEmpresa'";

    $resultado = mysqli_query($conexion, $consulta);

    if ($resultado) {
        // Enviar correo
        $mail = new PHPMailer(true);
        try {
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
            $mail->Subject = 'RFC VERIFICADO CORRECTAMENTE';
            
            // Cuerpo del correo con la notificación
            $mail->Body = "
                <p style='font-size: 16px;'>¡Hola <strong>$empresaNombre</strong>!</p>
                <p style='font-size: 15px;'>Nos complace informarte que tu cuenta ha sido verificada correctamente. El proceso de validación de tu RFC ha sido exitoso.</p>
                
                <p style='font-size: 15px;'>Ahora podrás acceder a todos los servicios que ofrecemos, con la certeza de que tu información está actualizada y verificada por CODEMX.</p>
                
                <p style='margin-top: 20px;'>
                    <a href='https://www.codemx.net/codemx/frontend/build/iniciar-sesion' 
                    style='display: inline-block; padding: 10px 20px; background-color: #0B1C26; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                    Ir a CODEMX
                    </a>
                </p>

                <p style='font-size: 13px; color: #888;'>Este correo es automático. No respondas a esta dirección.</p>
            ";

            $mail->send();
            echo json_encode(['success' => true, 'message' => 'RFC Verificado actualizado correctamente.']);
        } catch (Exception $e) {
            die(json_encode(['error' => 'No se pudo enviar el correo de notificacion: ' . $mail->ErrorInfo]));
        }
        
    } else {
        echo json_encode(['error' => 'Error al actualizar el RFC Verificado.']);
    }

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
