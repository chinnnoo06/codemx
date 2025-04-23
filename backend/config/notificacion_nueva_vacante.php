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

if (!getenv('SMTP_HOST')) {
    die('Error: No se pudieron cargar las variables de entorno');
}

// Encabezados CORS
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
    $datos = json_decode(file_get_contents('php://input'), true);

    if (!isset($datos['idEmpresa']) || !isset($datos['nombreEmpresa']) || !isset($datos['idVacante'])) {
        echo json_encode(['error' => 'Faltan datos importantes']);
        http_response_code(400);
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $datos['idEmpresa']);
    $nombreEmpresa = mysqli_real_escape_string($conexion, $datos['nombreEmpresa']);
    $idVacante = mysqli_real_escape_string($conexion, $datos['idVacante']);
    $tipoEvento = 'nueva_post';
    $fechaCreacion = date('Y-m-d H:i:s');

    // Obtener todos los candidatos que siguen a esta empresa
    $consultaSeguidores = "
        SELECT 
            candidato.ID AS ID_Candidato, 
            candidato.Email AS Email_Candidato, 
            candidato.Nombre AS Nombre_Candidato, 
            candidato.Apellido AS Apellido_Candidato
        FROM seguidores 
        INNER JOIN candidato ON seguidores.Candidato_ID = candidato.ID
        WHERE seguidores.Empresa_ID = '$idEmpresa'
    ";

    $resultadoSeguidores = mysqli_query($conexion, $consultaSeguidores);

    if (!$resultadoSeguidores || mysqli_num_rows($resultadoSeguidores) === 0) {
        throw new Exception("La empresa no tiene seguidores.");
    }

    $errores = [];

    while ($fila = mysqli_fetch_assoc($resultadoSeguidores)) {
        $idCandidato = $fila['ID_Candidato'];
        $emailDestino = $fila['Email_Candidato'];
        $nombreCandidato = $fila['Nombre_Candidato'];
        $apellidoCandidato = $fila['Apellido_Candidato'];

        $descripcion = "¡Hola $nombreCandidato $apellidoCandidato! Queremos informarte que $nombreEmpresa ha agregado una nueva vacante. Te invitamos a revisarla cuanto antes!";

        // Insertar notificación
        $consultaNotificacion = "
            INSERT INTO notificaciones (
                Candidato_ID, 
                Tipo_Evento, 
                Descripcion, 
                Fecha_Creacion,
                Vacante_ID, 
                Perfil_Empresa
            ) VALUES (
                '$idCandidato', 
                '$tipoEvento', 
                '$descripcion', 
                '$fechaCreacion', 
                '$idVacante',
                '$idEmpresa'
            )
        ";

        if (!mysqli_query($conexion, $consultaNotificacion)) {
            $errores[] = "Error al guardar notificación para $emailDestino: " . mysqli_error($conexion);
            continue;
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
            $mail->Subject = 'NUEVA VACANTE DE EMPRESA';
            $mail->Body = "
                <p style='font-size: 16px;'>Hola <strong>$nombreCandidato $apellidoCandidato</strong>,</p>
                <p style='font-size: 15px;'>$nombreEmpresa ha agregado una nueva vacante en CODEMX. ¡Te invitamos a revisarla!</p>
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
            $errores[] = "Error al enviar correo a $emailDestino: " . $mail->ErrorInfo;
        }
    }

    if (count($errores) > 0) {
        echo json_encode(['success' => false, 'message' => 'Se completó parcialmente.', 'errores' => $errores]);
    } else {
        echo json_encode(['success' => true, 'message' => 'Notificaciones y correos enviados a todos los seguidores.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
