<?php
require_once '../config/conexion.php';
require_once '../env_loader.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

loadEnv(__DIR__ . '/../../.env');

// CORS
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
        !isset($data['idComentario']) || 
        !isset($data['nombreUsuario']) || 
        !isset($data['contenidoComentario']) || 
        !isset($data['email']) || 
        (!isset($data['idEmpresa']) && !isset($data['idCandidato']))
    ) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos importantes']);
        http_response_code(400);
        exit();
    }

    $idComentario = mysqli_real_escape_string($conexion, $data['idComentario']);
    $idEmpresa = isset($data['idEmpresa']) ? mysqli_real_escape_string($conexion, $data['idEmpresa']) : null;
    $idCandidato = isset($data['idCandidato']) ? mysqli_real_escape_string($conexion, $data['idCandidato']) : null;
    $nombreUsuario = mysqli_real_escape_string($conexion, $data['nombreUsuario']);
    $contenidoComentario = mysqli_real_escape_string($conexion, $data['contenidoComentario']);
    $emailDestino = mysqli_real_escape_string($conexion, $data['email']);
    $tipoEvento = 'eliminacion_comentario';
    $fechaCreacion = date('Y-m-d H:i:s');

    $consultaDelete = "DELETE FROM comentarios WHERE ID = '$idComentario'";

    if (mysqli_query($conexion, $consultaDelete)) {
        // Armar consulta para insertar notificación
        $descripcion = "Hola $nombreUsuario, tu comentario fue eliminado por infringir nuestras normas: \"$contenidoComentario\"";

        $camposNotificacion = "Tipo_Evento, Descripcion, Fecha_Creacion";
        $valoresNotificacion = "'$tipoEvento', '$descripcion', '$fechaCreacion'";

        if ($idEmpresa) {
            $camposNotificacion .= ", Empresa_ID";
            $valoresNotificacion .= ", '$idEmpresa'";
        } elseif ($idCandidato) {
            $camposNotificacion .= ", Candidato_ID";
            $valoresNotificacion .= ", '$idCandidato'";
        }

        $consultaNotificacion = "INSERT INTO notificaciones ($camposNotificacion) VALUES ($valoresNotificacion)";

        if (!mysqli_query($conexion, $consultaNotificacion)) {
            echo json_encode(['success' => false, 'error' => 'Error al guardar la notificación: ' . mysqli_error($conexion)]);
            exit();
        }

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

            $mail->setFrom(getenv('SMTP_USERNAME'), 'CODEMX');
            $mail->addAddress($emailDestino);
            $mail->isHTML(true);
            $mail->Subject = 'COMENTARIO ELIMINADO POR NORMATIVA';
            $mail->Body = "
                <p>Hola <strong>$nombreUsuario</strong>,</p>
                <p>Tu comentario ha sido eliminado por infringir nuestras normas:</p>
                <blockquote><em>$contenidoComentario</em></blockquote>
                <p style='font-size: 13px; color: #888;'>Este correo es automático. No respondas a esta dirección.</p>
            ";

            $mail->send();
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => 'Comentario eliminado, pero el correo falló: ' . $mail->ErrorInfo]);
            exit();
        }

        echo json_encode(['success' => true, 'message' => 'Comentario eliminado correctamente.']);
        exit();
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al eliminar comentario: ' . mysqli_error($conexion)]);
        exit();
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    exit();
}
