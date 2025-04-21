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

    if (!isset($data['idEmpresa']) || !isset($data['empresaNombre'])) {
        echo json_encode(['error' => 'Faltan datos importantes']);
        http_response_code(400);
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $empresaNombre = mysqli_real_escape_string($conexion, $data['empresaNombre']);
    $tipoEvento = 'vacante_inactiva';
    $fechaLimiteComparacion = date('Y-m-d H:i:s', strtotime('-30 days'));

    // Obtener correo de la empresa
    $consultaCorreo = "SELECT Email FROM empresa WHERE ID = '$idEmpresa' LIMIT 1";
    $resultadoCorreo = mysqli_query($conexion, $consultaCorreo);

    if (!$resultadoCorreo || mysqli_num_rows($resultadoCorreo) === 0) {
        throw new Exception("No se encontró el correo de la empresa.");
    }

    $filaCorreo = mysqli_fetch_assoc($resultadoCorreo);
    $emailDestino = $filaCorreo['Email'];

    // Buscar vacantes inactivas con fecha límite mayor a 30 días
    $consultaVacantes = "SELECT ID, Titulo FROM vacante 
                         WHERE Empresa_ID = '$idEmpresa' 
                         AND Estado = 'inactiva' 
                         AND Fecha_Limite < '$fechaLimiteComparacion'";

    $resultadoVacantes = mysqli_query($conexion, $consultaVacantes);

    if ($resultadoVacantes && mysqli_num_rows($resultadoVacantes) > 0) {
        while ($vacante = mysqli_fetch_assoc($resultadoVacantes)) {
            $idVacante = $vacante['ID'];
            $tituloVacante = $vacante['Titulo'];
            $fechaCreacion = date('Y-m-d H:i:s');
            $descripcion = "Hola $empresaNombre, la vacante \"$tituloVacante\" ha estado inactiva por más de 30 días. Te sugerimos actualizarla o crear una nueva para atraer a más candidatos.";

            // Guardar notificación
            $consultaNotificacion = "INSERT INTO notificaciones (Empresa_ID, Tipo_Evento, Descripcion, Fecha_Creacion, Vacante_ID)
                                     VALUES ('$idEmpresa', '$tipoEvento', '$descripcion', '$fechaCreacion', '$idVacante')";

            mysqli_query($conexion, $consultaNotificacion); // No detenemos en error aquí para seguir con otras

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
            $mail->Subject = 'Vacante Inactiva - Acción Recomendada';
            $mail->Body = "
                <p style='font-size: 16px;'>Hola <strong>$empresaNombre</strong>,</p>
                <p style='font-size: 15px;'>Detectamos que la vacante <strong>$tituloVacante</strong> lleva más de 30 días inactiva desde su fecha límite. 
                Te recomendamos revisarla, actualizar su información o publicar una nueva para mejorar tus oportunidades de encontrar candidatos.</p>

                <p style='margin-top: 20px;'>
                    <a href='https://www.codemx.net/codemx/frontend/build/iniciar-sesion' 
                    style='display: inline-block; padding: 10px 20px; background-color: #0B1C26; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                    Ir a CODEMX
                    </a>
                </p>

                <p style='font-size: 13px; color: #888;'>Este correo es automático. No respondas a esta dirección.</p>
            ";

            $mail->send();
        }

        echo json_encode(['success' => true, 'message' => 'Se enviaron notificaciones por vacantes inactivas.']);
    } else {
        echo json_encode(['success' => true, 'message' => 'No hay vacantes inactivas con más de 30 días.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
