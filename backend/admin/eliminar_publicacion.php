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
        !isset($data['idPublicacion']) || 
        !isset($data['nombreEmpresa']) || 
        !isset($data['emailEmpresa']) || 
        !isset($data['idEmpresa'])
    ) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos importantes']);
        http_response_code(400);
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);
    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $nombreEmpresa = mysqli_real_escape_string($conexion, $data['nombreEmpresa']);
    $emailDestino = mysqli_real_escape_string($conexion, $data['emailEmpresa']);
    $tipoEvento = 'eliminacion_contenido';
    $fechaCreacion = date('Y-m-d H:i:s');

    $consultaDelete = "DELETE FROM publicacion WHERE ID = '$idPublicacion'";

    if (mysqli_query($conexion, $consultaDelete)) {
          // Insertar notificación
        $descripcion = "¡Hola $nombreEmpresa! Queremos informarte que una publicación de tu perfil fue eliminada ya que infringe las normativas de la plataforma.";

        $stmt = $conexion->prepare("
            INSERT INTO notificaciones (
                Empresa_ID, 
                Tipo_Evento, 
                Descripcion, 
                Fecha_Creacion
            ) VALUES (?, ?, ?, ?)
        ");

        $stmt->bind_param("isss", $idEmpresa, $tipoEvento, $descripcion, $fechaCreacion);

        if (!$stmt->execute()) {
            echo json_encode(['success' => false, 'error' => 'Error al registrar la notificación: ' . $stmt->error]);
            exit();
        }

        $consultaStrikes = "UPDATE verificacion_usuarios SET Strikes = Strikes + 1 WHERE Empresa_ID = '$idEmpresa'";
        mysqli_query($conexion, $consultaStrikes);

        if (!mysqli_query($conexion, $consultaStrikes)) {
            echo json_encode(['success' => false, 'error' => 'Error al registrar strike: ' . $stmt->error]);
            exit();
        }

         // Enviar correo
        try {
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
            $mail->Subject = 'PUBLICACION ELIMINADA POR NORMATIVA';
            $mail->Body = "
                <p style='font-size: 16px;'>Hola <strong>$nombreEmpresa</strong>,</p>
                <p style='font-size: 15px;'>Queremos informarte que una publicación de tu perfil fue eliminada ya que infringe las normativas de la plataforma.</p>
                <p style='margin-top: 20px;'>
                    <a href='https://www.codemx.net/codemx/frontend/build/iniciar-sesion' 
                    style='display: inline-block; padding: 10px 20px; background-color: #0B1C26; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                    Ir a CODEMX
                    </a>
                </p>
                <p style='font-size: 13px; color: #888;'>Este correo es automático. No respondas a esta dirección.</p>
            ";

            $mail->send();
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => 'La publicacion fue eliminada, pero el correo falló: ' . $mail->ErrorInfo]);
            exit();
        }


        echo json_encode([
            'success' => true, 
            'message' => 'Publicacion eliminada correctamente.'
        ]);
        exit();
    } else {
        echo json_encode([
            'success' => false, 
            'error' => 'Error al eliminar la publicacion: ' . mysqli_error($conexion)
        ]);
        exit();
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    exit();
}
?>
