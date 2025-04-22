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

    if (!isset($data['idEmpresa']) || !isset($data['empresaNombre']) || !isset($data['candidatoNombre']) || !isset($data['candidatoApellido']) || !isset($data['idPublicacion']) || !isset($data['esLike'])) {
        echo json_encode(['error' => 'Faltan datos importantes']);
        http_response_code(400);
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $empresaNombre = mysqli_real_escape_string($conexion, $data['empresaNombre']);
    $candidatoNombre = mysqli_real_escape_string($conexion, $data['candidatoNombre']);
    $candidatoApellido = mysqli_real_escape_string($conexion, $data['candidatoApellido']);
    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);
    $esLike = mysqli_real_escape_string($conexion, $data['esLike']);
    $tipoEvento = 'reaccion';
    // ✅ Generar la descripción según si es like o comentario
    if ($esLike === "1" || $esLike === 1 || $esLike === true || $esLike === "true") {
        $descripcion = "Hola $empresaNombre, $candidatoNombre $candidatoApellido le ha dado like a tu publicación. ¡Entra a la publicación para ver su interacción!";
    } else {
        $descripcion = "Hola $empresaNombre, $candidatoNombre $candidatoApellido ha comentado en tu publicación. ¡Entra a la publicación para leerlo!";
    }
    $fechaCreacion = date('Y-m-d H:i:s');
    $fechaActual = date('Y-m-d H:i:s');

    // Obtener correo del candidato (quien envió el mensaje)
    $consultaCorreo = "SELECT Email FROM empresa WHERE ID = '$idEmpresa' LIMIT 1";
    $resultadoCorreo = mysqli_query($conexion, $consultaCorreo);

    if (!$resultadoCorreo || mysqli_num_rows($resultadoCorreo) === 0) {
        throw new Exception("No se encontró el correo del candidato.");
    }

    $filaCorreo = mysqli_fetch_assoc($resultadoCorreo);
    $emailDestino = $filaCorreo['Email'];

    // Verificar si ya se envió una notificación recientemente (últimos 3 minutos)
    $consultaReciente = "
    SELECT ID 
    FROM notificaciones 
    WHERE Empresa_ID = '$idEmpresa' 
    AND Chat_ID = '$idChat'
    AND Tipo_Evento = 'reaccion'
    AND TIMESTAMPDIFF(MINUTE, Fecha_Creacion, '$fechaActual') < 5
    LIMIT 1
    ";

    $resultadoReciente = mysqli_query($conexion, $consultaReciente);

    if (mysqli_num_rows($resultadoReciente) > 0) {
    // Ya hay una notificación reciente, no se envía otra
    echo json_encode(['success' => true, 'message' => 'Ya existe una notificación reciente.']);
    exit();
    }

    // Insertar en la tabla de notificaciones
    $consultaNotificacion = "INSERT INTO notificaciones (Empresa_ID, Tipo_Evento, Descripcion, Fecha_Creacion, Publicacion_ID)
                                VALUES ('$idEmpresa', '$tipoEvento', '$descripcion', '$fechaCreacion', '$idPublicacion')";

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

    if ($esLike === "1" || $esLike === 1 || $esLike === true || $esLike === "true") {
        $mail->Subject = 'NUEVO LIKE EN TU PUBLICACION';
        $mail->Body = "
            <p style='font-size: 16px;'>Hola <strong>$empresaNombre</strong>,</p>
            <p style='font-size: 15px;'>$candidatoNombre $candidatoApellido le ha dado like a una de tus publicaciones en CODEMX.</p>
            <p style='font-size: 15px;'>¡Ingresa ahora y revisa su interacción!</p>
            <p style='margin-top: 20px;'>
                <a href='https://www.codemx.net/codemx/frontend/build/iniciar-sesion' 
                style='display: inline-block; padding: 10px 20px; background-color: #0B1C26; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                Ir a CODEMX
                </a>
            </p>
            <p style='font-size: 13px; color: #888;'>Este correo es automático. No respondas a esta dirección.</p>
        ";
    } else {
        $mail->Subject = 'NUEVO COMENTARIO EN TU PUBLICACION';
        $mail->Body = "
            <p style='font-size: 16px;'>Hola <strong>$empresaNombre</strong>,</p>
            <p style='font-size: 15px;'>$candidatoNombre $candidatoApellido ha comentado en una de tus publicaciones en CODEMX.</p>
            <p style='font-size: 15px;'>¡Ingresa ahora y revisa su mensaje!</p>
            <p style='margin-top: 20px;'>
                <a href='https://www.codemx.net/codemx/frontend/build/iniciar-sesion' 
                style='display: inline-block; padding: 10px 20px; background-color: #0B1C26; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                Ir a CODEMX
                </a>
            </p>
            <p style='font-size: 13px; color: #888;'>Este correo es automático. No respondas a esta dirección.</p>
        ";
    }

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Notificación registrada y correo enviado.']);


} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
