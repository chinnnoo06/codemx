<?php
require_once '../config/conexion.php';
require_once '../env_loader.php'; // Ruta al cargador de variables de entorno
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Cargar las variables de entorno desde .env
loadEnv(__DIR__ . '/../../.env');

// Verificar que las variables de entorno se cargaron
if (!getenv('SMTP_HOST')) {
    die('Error: No se pudieron cargar las variables de entorno');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $nombre = mysqli_real_escape_string($conexion, $_POST['nombre']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $password = mysqli_real_escape_string($conexion, $_POST['password']);
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $sector = mysqli_real_escape_string($conexion, $_POST['sector']);
    $tamanio = mysqli_real_escape_string($conexion, $_POST['tamanio']);
    $estado = mysqli_real_escape_string($conexion, $_POST['estado']);
    $direccion = mysqli_real_escape_string($conexion, $_POST['direccion']);
    $telefono = mysqli_real_escape_string($conexion, $_POST['telefono']);
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $fechaCreacion = mysqli_real_escape_string($conexion, $_POST['fechaCreacion']);
    $rfc = mysqli_real_escape_string($conexion, $_POST['rfc']);

    // Dominio del servidor
    $serverUrl = 'https://codemx.net/codemx/public';

    // Rutas relativas y absolutas para almacenamiento
    $logoDirRelativo = '/resources/fotos_perfil_empresas/';
    $logoDir = realpath(__DIR__ . '/../../public/resources/fotos_perfil_empresas/');


    // Validar rutas y crear carpetas si no existen
    if (!file_exists($logoDir)) {
        if (!mkdir($logoDir, 0777, true)) {
            die(json_encode(['error' => 'No se pudo crear el directorio para las fotografías.']));
        }
    }

    // Guardar el logo
    $logoRutaCompleta = null;
    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $logoNumero = count(glob($logoDir . "/perfil*")) + 1;
        $logoNombre = "perfil" . $logoNumero . "." . pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION);
        $logoRutaRelativa = $logoDirRelativo . $logoNombre;
        $logoRutaCompleta = $serverUrl . $logoRutaRelativa;
        if (!move_uploaded_file($_FILES['logo']['tmp_name'], $fotografiaDir . '/' . $fotoNombre)) {
            die(json_encode(['error' => 'Error al guardar el logo.']));
        }
    } else {
        // Asignar una imagen por defecto si no se subió ninguna fotografía
        $logoRutaCompleta = $serverUrl . $logoDirRelativo . 'Usuario.png';
    }

    // Guardar los datos de empresa
    $consultaEmpresa = "INSERT INTO empresa (Nombre, Password, Descripcion, Sector, Tamanio, Estado , Direccion, Telefono, Email, Fecha_Creacion, RFC, Logo)
        VALUES ('$nombre', '$passwordHash', '$descripcion', '$sector', '$tamanio', '$estado', '$direccion', '$telefono', '$email', '$fechaCreacion', '$rfc', '$logoRutaRelativa')";

    if (mysqli_query($conexion, $consultaEmpresa)) {
        $empresaId = mysqli_insert_id($conexion); 

        // Generar token de verificación
        $token = bin2hex(random_bytes(16)); 
        $fechaExpiracion = date('Y-m-d H:i:s', strtotime('+1 hour')); // Expira en 1 hora
        $fechaActual = date('Y-m-d H:i:s');

        $consultaToken = "INSERT INTO verificacion_usuarios (Empresa_ID, Token_Verificacion, Fecha_Expiracion_Token, Correo_Verificado, Fecha_Registro, Fecha_Actualizacion)
        VALUES ('$empresaId', '$token', '$fechaExpiracion', 0, '$fechaActual', '$fechaActual')";
        if (!mysqli_query($conexion, $consultaToken)) {
            die(json_encode(['error' => 'Error al guardar el token de verificación: ' . mysqli_error($conexion)]));
        }

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

            $mail->isHTML(true);
            $mail->Subject = 'Verificar de cuenta';
            $mail->Body = "Hola $nombre, por favor verifica tu cuenta haciendo clic en el siguiente enlace, te mandará a la pagína de iniciar sesión y ya podras utilizar tu cuenta: <a href='https://www.codemx.net/codemx/backend/login-crearcuenta/verificar_correo.php?token=$token'>Verificar Cuenta</a>";

            $mail->send();
            echo json_encode(['success' => 'Registro exitoso. Correo de verificación enviado.']);
        } catch (Exception $e) {
            die(json_encode(['error' => 'No se pudo enviar el correo de verificación: ' . $mail->ErrorInfo]));
        }

    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
