<?php
require_once '../config/conexion.php';
require_once '../env_loader.php'; // Ruta al cargador de variables de entorno
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Cargar las variables de entorno desde .env
loadEnv(__DIR__ . '/../../.env');

// Verificar que las variables de entorno se cargaron
if (!getenv('SMTP_HOST')) {
    die('Error: No se pudieron cargar las variables de entorno');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['Correo_Electronico']);
    $password = $_POST['Password'];

    // Consulta para candidato y empresa (sin admin)
    $consulta_usuario = "
    SELECT 
        'candidato' AS tipo, 
        candidato.ID, 
        candidato.Password, 
        verificacion_usuarios.Correo_Verificado, 
        verificacion_usuarios.Estado_Cuenta, 
        NULL AS RFC_Verificado
    FROM candidato
    LEFT JOIN verificacion_usuarios ON verificacion_usuarios.Candidato_ID = candidato.ID
    WHERE candidato.Email = '$email'
    UNION
    SELECT 
        'empresa' AS tipo, 
        empresa.ID, 
        empresa.Password, 
        verificacion_usuarios.Correo_Verificado, 
        verificacion_usuarios.Estado_Cuenta, 
        verificacion_usuarios.RFC_Verificado
    FROM empresa
    LEFT JOIN verificacion_usuarios ON verificacion_usuarios.Empresa_ID = empresa.ID
    WHERE empresa.Email = '$email'
    LIMIT 1";

    $resultado_usuario = mysqli_query($conexion, $consulta_usuario);

    if (!$resultado_usuario) {
        echo json_encode(['success' => false, 'error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        exit();
    }

    $fila_usuario = mysqli_fetch_assoc($resultado_usuario);

    // Si no se encontró un candidato o empresa, hacer la consulta para el administrador
    if (!$fila_usuario) {
        $consulta_admin = "
        SELECT 
            'admin' AS tipo, 
            administrador.ID, 
            administrador.Password, 
            1 AS Correo_Verificado, 
            1 AS Estado_Cuenta, 
            NULL AS RFC_Verificado
        FROM administrador
        WHERE administrador.Email = '$email'
        LIMIT 1";

        $resultado_admin = mysqli_query($conexion, $consulta_admin);

        if (!$resultado_admin) {
            echo json_encode(['success' => false, 'error' => 'Error en la consulta SQL para admin: ' . mysqli_error($conexion)]);
            exit();
        }

        $fila_admin = mysqli_fetch_assoc($resultado_admin);

        if ($fila_admin && password_verify($password, $fila_admin['Password'])) {
            // Generar session_id único
            $session_id = bin2hex(random_bytes(32));
            $creado_en = date('Y-m-d H:i:s');
            $expira_en = date('Y-m-d H:i:s', strtotime('+1 hour'));

            // Insertar sesión en la tabla
            $user_id = $fila_admin['ID'];
            $insert_query = "INSERT INTO sesiones (Session_id, Admin_id, Creado_en, Expira_en) VALUES ('$session_id', $user_id, '$creado_en', '$expira_en')";

            if (!mysqli_query($conexion, $insert_query)) {
                echo json_encode(['success' => false, 'error' => 'Error al guardar la sesión para admin: ' . mysqli_error($conexion)]);
                exit();
            }

            echo json_encode(['success' => true, 'tipo' => $fila_admin['tipo'], 'session_id' => $session_id]);
            exit();
        } else {
            echo json_encode(['success' => false, 'error' => 'Correo o contraseña incorrectos para admin.']);
            exit();
        }
    }

    // Si es candidato o empresa
    if ($fila_usuario && password_verify($password, $fila_usuario['Password'])) {
        if ($fila_usuario['tipo'] === 'candidato') {
            if ($fila_usuario['Correo_Verificado'] == 1 && $fila_usuario['Estado_Cuenta'] == 1) {
                // Generar session_id único
                $session_id = bin2hex(random_bytes(32));
                $creado_en = date('Y-m-d H:i:s');
                $expira_en = date('Y-m-d H:i:s', strtotime('+1 hour'));

                // Insertar sesión en la tabla
                $user_id = $fila_usuario['ID'];
                $insert_query = "INSERT INTO sesiones (Session_id, Candidato_id, Creado_en, Expira_en) VALUES ('$session_id', $user_id, '$creado_en', '$expira_en')";

                if (!mysqli_query($conexion, $insert_query)) {
                    echo json_encode(['success' => false, 'error' => 'Error al guardar la sesión: ' . mysqli_error($conexion)]);
                    exit();
                }

                // Limpiar sesiones vencidas
                $consultaEliminar = "DELETE FROM sesiones WHERE Expira_En < '$fechaActual'";

                if (!mysqli_query($conexion, $consultaEliminar)) {
                    echo json_encode(['success' => false, 'error' => 'Error al limpiar sesiones: ' . mysqli_error($conexion)]);
                    exit();
                }

                echo json_encode(['success' => true, 'tipo' => $fila_usuario['tipo'], 'session_id' => $session_id]);
                exit();
            } elseif ($fila_usuario['Correo_Verificado'] == 0 && $fila_usuario['Estado_Cuenta'] == 1) {
                // Actualizar fecha de expiración del token
                $nuevoToken = bin2hex(random_bytes(16)); // Generar nuevo token
                $fechaExpiracion = date('Y-m-d H:i:s', strtotime('+1 hour'));

                $actualizarToken = "
                UPDATE verificacion_usuarios 
                SET Token_Verificacion = '$nuevoToken', Fecha_Expiracion_Token = '$fechaExpiracion' 
                WHERE (Candidato_ID = {$fila_usuario['ID']})";

                if (!mysqli_query($conexion, $actualizarToken)) {
                    echo json_encode(['success' => false, 'error' => 'Error al actualizar el token: ' . mysqli_error($conexion)]);
                    exit();
                }

                // Enviar correo de verificación
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

                    $nombre = $fila_usuario['Nombre'];
                    $mail->isHTML(true);
                    $mail->Subject = 'TOKEN PARA VERIFICAR CUENTA';
                    $mail->Body = "Hola $nombre, por favor verifica tu cuenta haciendo clic en el siguiente enlace: 
                    <a href='https://www.codemx.net/codemx/backend/login-crearcuenta/verificar_correo.php?token=$nuevoToken'>Verificar Cuenta</a>";

                    $mail->send();
                    echo json_encode(['success' => true, 'redirect' => '/falta-verificar-correo', 'message' => 'Correo de verificación reenviado.']);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'error' => 'No se pudo enviar el correo de verificación: ' . $mail->ErrorInfo]);
                }
                exit();
            } elseif ($fila_usuario['Correo_Verificado'] == 1 && $fila_usuario['Estado_Cuenta'] == 0) {
                echo json_encode(['success' => false, 'message' => 'Tu cuenta está deshabilitada.']);
                exit();
            } else {
                echo json_encode(['success' => false, 'error' => 'Tu cuenta no está activa o el correo no ha sido verificado.']);
                exit();
            }
        } elseif ($fila_usuario['tipo'] === 'empresa') {
            if ($fila_usuario['Correo_Verificado'] == 1 && $fila_usuario['Estado_Cuenta'] == 1 && $fila_usuario['RFC_Verificado'] == 1) {
                // Generar session_id único
                $session_id = bin2hex(random_bytes(32));
                $creado_en = date('Y-m-d H:i:s');
                $expira_en = date('Y-m-d H:i:s', strtotime('+1 hour'));

                // Insertar sesión en la tabla
                $user_id = $fila_usuario['ID'];
                $insert_query = "INSERT INTO sesiones (Session_id, Empresa_id, Creado_en, Expira_en) VALUES ('$session_id', $user_id, '$creado_en', '$expira_en')";

                if (!mysqli_query($conexion, $insert_query)) {
                    echo json_encode(['success' => false, 'error' => 'Error al guardar la sesión: ' . mysqli_error($conexion)]);
                    exit();
                }

                // Limpiar sesiones vencidas
                $consultaEliminar = "DELETE FROM sesiones WHERE Expira_En < '$fechaActual'";

                if (!mysqli_query($conexion, $consultaEliminar)) {
                    echo json_encode(['success' => false, 'error' => 'Error al limpiar sesiones: ' . mysqli_error($conexion)]);
                    exit();
                }

                echo json_encode(['success' => true, 'tipo' => $fila_usuario['tipo'], 'session_id' => $session_id]);
                exit();
            } elseif ($fila_usuario['Correo_Verificado'] == 1 && $fila_usuario['Estado_Cuenta'] == 1 && $fila_usuario['RFC_Verificado'] == 0) {
                echo json_encode(['success' => true, 'redirect' => '/falta-verificar-rfc', 'message' => 'Falta verificar RFC.']);
                exit();
            } elseif ($fila_usuario['Correo_Verificado'] == 0 && $fila_usuario['Estado_Cuenta'] == 1 && $fila_usuario['RFC_Verificado'] == 0) {
                // Actualizar fecha de expiración del token
                $nuevoToken = bin2hex(random_bytes(16)); // Generar nuevo token
                $fechaExpiracion = date('Y-m-d H:i:s', strtotime('+1 hour'));

                $actualizarToken = "
                UPDATE verificacion_usuarios 
                SET Token_Verificacion = '$nuevoToken', Fecha_Expiracion_Token = '$fechaExpiracion' 
                WHERE (Empresa_ID = {$fila_usuario['ID']})";

                if (!mysqli_query($conexion, $actualizarToken)) {
                    echo json_encode(['success' => false, 'error' => 'Error al actualizar el token: ' . mysqli_error($conexion)]);
                    exit();
                }

                // Enviar correo de verificación
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

                    $nombre = $fila_usuario['Nombre'];
                    $mail->isHTML(true);
                    $mail->Subject = 'TOKEN PARA VERIFICAR CUENTA';
                    $mail->Body = "Hola $nombre, por favor verifica tu cuenta haciendo clic en el siguiente enlace: 
                    <a href='https://www.codemx.net/codemx/backend/login-crearcuenta/verificar_correo.php?token=$nuevoToken'>Verificar Cuenta</a>";

                    $mail->send();
                    echo json_encode(['success' => true, 'redirect' => '/falta-verificar-correo', 'message' => 'Correo de verificación reenviado.']);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'error' => 'No se pudo enviar el correo de verificación: ' . $mail->ErrorInfo]);
                }
                exit();
            } elseif ($fila_usuario['Correo_Verificado'] == 1 && $fila_usuario['Estado_Cuenta'] == 0 && $fila_usuario['RFC_Verificado'] == 1) {
                echo json_encode(['success' => false, 'message' => 'Tu cuenta está deshabilitada.']);
                exit();
            } else {
                echo json_encode(['success' => false, 'error' => 'Tu cuenta no está activa, el correo no ha sido verificado, o falta la verificación del RFC.']);
                exit();
            }
        }
        
    } else {
        echo json_encode(['success' => false, 'error' => 'Correo o contraseña incorrectos.']);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido.']);
}
?>
