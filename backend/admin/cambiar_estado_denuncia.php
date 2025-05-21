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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validación de los datos
    if (!isset($data['idDenuncia']) || !isset($data['idDenunciado']) || !isset($data['nuevoEstado']) || !isset($data['tipo']) || !isset($data['nombreDenunciado'])) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos esenciales para procesar la denuncia.']);
        http_response_code(400);
        exit();
    }

    $idDenuncia = mysqli_real_escape_string($conexion, $data['idDenuncia']);
    $idDenunciado = mysqli_real_escape_string($conexion, $data['idDenunciado']);
    $estado = mysqli_real_escape_string($conexion, $data['nuevoEstado']);
    $tipo = mysqli_real_escape_string($conexion, $data['tipo']);
    $nombreDenunciado = mysqli_real_escape_string($conexion, $data['nombreDenunciado']);
    $apellidoDenunciado = isset($data['apellidoDenunciado']) ? mysqli_real_escape_string($conexion, $data['apellidoDenunciado']) : '';
    $fechaActual = date('Y-m-d H:i:s');
    $tipoEvento = 'strike';
    $nombreCompleto = $nombreDenunciado . ($apellidoDenunciado !== '' ? " $apellidoDenunciado" : '');
    $descripcion = "¡Hola $nombreCompleto! Tu cuenta ha recibido un strike a causa de una denuncia de un acto que infrinja las normas de la plataforma, que no vuelva a suceder.";

    mysqli_begin_transaction($conexion);

    try {
        if ($estado == 1) {
            if ($tipo == "CandidatoCandidato") {
                $consulta = "UPDATE denuncia_candidato_candidato SET Estado_Denuncia = 2 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncia_candidato_candidato.");
                }
                $consultaNoti = "INSERT INTO notificaciones (Candidato_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
                                VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
                if (!mysqli_query($conexion, $consultaNoti)) {
                    throw new Exception("Error al insertar la notificación.");
                }
            }

            if ($tipo == "CandidatoEmpresa") {
                $consulta = "UPDATE denuncia_candidato_empresa SET Estado_Denuncia = 2 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncia_candidato_empresa.");
                }
                $consultaNoti = "INSERT INTO notificaciones (Empresa_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
                                VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
                if (!mysqli_query($conexion, $consultaNoti)) {
                    throw new Exception("Error al insertar la notificación.");
                }
            }

            if ($tipo == "EmpresaCandidato") {
                $consulta = "UPDATE denuncia_empresa_candidato SET Estado_Denuncia = 2 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncia_empresa_candidato.");
                }
                $consultaNoti = "INSERT INTO notificaciones (Candidato_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
                                VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
                if (!mysqli_query($conexion, $consultaNoti)) {
                    throw new Exception("Error al insertar la notificación.");
                }
            }

            // SOLO AQUÍ ENVÍO EL CORREO, UNA SOLA VEZ Y SOLO SI ESTADO == 1
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

                // Aquí debes obtener el email del denunciado para enviar el correo
                // Suponiendo que lo tienes en $emailDestino, si no, debes buscarlo en DB
                $emailDestino = ''; // REEMPLAZA con el correo real del denunciado

                if (empty($emailDestino)) {
                    throw new Exception("Email del denunciado no especificado.");
                }

                $mail->addAddress($emailDestino);

                $mail->isHTML(true);
                $mail->Subject = 'STRIKE A TU CUENTA';
                $mail->Body = "
                    <p style='font-size: 16px;'>Hola <strong>$nombreDenunciado</strong>,</p>
                    <p style='font-size: 15px;'>Tu cuenta ha recibido un strike a causa de una denuncia de un acto que infrinja las normas de la plataforma, que no vuelva a suceder.</p>
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
                mysqli_rollback($conexion);
                echo json_encode(['success' => false, 'error' => 'La notificación se guardó, pero el correo falló: ' . $mail->ErrorInfo]);
                http_response_code(500);
                exit();
            }

            echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado y correo enviado correctamente.']);
        } 
        else if ($estado == 0) {
            if ($tipo == "CandidatoCandidato") {
                $consulta = "UPDATE denuncia_candidato_candidato SET Estado_Denuncia = 3 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncia_candidato_candidato.");
                }
            }

            if ($tipo == "CandidatoEmpresa") {
                $consulta = "UPDATE denuncia_candidato_empresa SET Estado_Denuncia = 3 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncia_candidato_empresa.");
                }
            }

            if ($tipo == "EmpresaCandidato") {
                $consulta = "UPDATE denuncia_empresa_candidato SET Estado_Denuncia = 3 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncia_empresa_candidato.");
                }
            }

            echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
        }

        mysqli_commit($conexion);
    } catch (Exception $e) {
        mysqli_rollback($conexion);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        http_response_code(500);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
