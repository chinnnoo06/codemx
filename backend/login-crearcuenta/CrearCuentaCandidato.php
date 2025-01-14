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
    $apellido = mysqli_real_escape_string($conexion, $_POST['apellido']);
    $password = mysqli_real_escape_string($conexion, $_POST['password']);
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $fechaNacimiento = mysqli_real_escape_string($conexion, $_POST['fechaNacimiento']);
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $telefono = mysqli_real_escape_string($conexion, $_POST['telefono']);
    $estado = mysqli_real_escape_string($conexion, $_POST['estado']);
    $direccion = mysqli_real_escape_string($conexion, $_POST['direccion']);
    $sexo = mysqli_real_escape_string($conexion, $_POST['sexo']);
    $universidad = mysqli_real_escape_string($conexion, $_POST['universidad']);
    $tiempoRestante = mysqli_real_escape_string($conexion, $_POST['tiempoRestante']);
    $modalidadTrabajo = mysqli_real_escape_string($conexion, $_POST['modalidadTrabajo']);

    $tecnologias = json_decode($_POST['tecnologias'], true); // Decodificar tecnologías del JSON enviado

    // Dominio del servidor
    $serverUrl = 'https://codemx.net/codemx/public';

    // Rutas relativas y absolutas para almacenamiento
    $fotografiaDirRelativo = '/resources/fotos_perfil_candidatos/';
    $curriculumDirRelativo = '/resources/cv/';
    $fotografiaDir = __DIR__ . '/../../public/resources/fotos_perfil_candidatos/';
    $curriculumDir = __DIR__ . '/../../public/resources/cv/';

    // Validar rutas y crear carpetas si no existen
    if (!file_exists($fotografiaDir)) {
        die(json_encode(['error' => 'El directorio para las fotografías no existe.']));
    }
    if (!file_exists($curriculumDir)) {
        die(json_encode(['error' => 'El directorio para los cv no existe.']));
    }

    // Guardar la fotografía
    $fotoRutaCompleta = null;
    if (isset($_FILES['fotografia']) && $_FILES['fotografia']['error'] === UPLOAD_ERR_OK) {
        $fotoNumero = count(glob($fotografiaDir . "/perfil*")) + 1;
        $fotoNombre = "perfil" . $fotoNumero . "." . pathinfo($_FILES['fotografia']['name'], PATHINFO_EXTENSION);
        $fotoRutaRelativa = $fotografiaDirRelativo . $fotoNombre;
        $fotoRutaCompleta = $serverUrl . $fotoRutaRelativa;
        if (!move_uploaded_file($_FILES['fotografia']['tmp_name'], $fotografiaDir . '/' . $fotoNombre)) {
            die(json_encode(['error' => 'Error al guardar la fotografía.']));
        }
    } else {
        // Asignar una imagen por defecto si no se subió ninguna fotografía
        $fotoRutaCompleta = $serverUrl . $fotografiaDirRelativo . 'Usuario.png';
    }

    // Guardar el currículum
    $cvRutaCompleta = null;
    if (isset($_FILES['curriculum']) && $_FILES['curriculum']['error'] === UPLOAD_ERR_OK) {
        $cvNumero = count(glob($curriculumDir . "/curriculum*")) + 1;
        $cvNombre = "curriculum" . $cvNumero . "." . pathinfo($_FILES['curriculum']['name'], PATHINFO_EXTENSION);
        $cvRutaRelativa = $curriculumDirRelativo . $cvNombre;
        $cvRutaCompleta = $serverUrl . $cvRutaRelativa;
        if (!move_uploaded_file($_FILES['curriculum']['tmp_name'], $curriculumDir . '/' . $cvNombre)) {
            die(json_encode(['error' => 'Error al guardar el currículum.']));
        }
    }

    $consultaCandidato = "INSERT INTO candidato (Nombre, Apellido, Password, Fecha_Nacimiento, Email, Telefono, Estado, Direccion, Sexo, Universidad, Tiempo_Restante, Modalidad_Trabajo, Fotografia, CV)
        VALUES ('$nombre', '$apellido', '$passwordHash', '$fechaNacimiento', '$email', '$telefono', '$estado', '$direccion', '$sexo', '$universidad', '$tiempoRestante', '$modalidadTrabajo', '$fotoRutaCompleta', '$cvRutaCompleta')";

    if (mysqli_query($conexion, $consultaCandidato)) {
        $candidatoId = mysqli_insert_id($conexion); 

        // Insertar valores predeterminados en detalles_publicos
        $consultaDetallesPublicos = "INSERT INTO detalles_publicos (Candidato_ID, Fecha_Nacimiento, Genero, Universidad, Tiempo_Graduacion, Modalidad_Trabajo, Direccion, Telefono)
        VALUES ('$candidatoId', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)";

        if (!mysqli_query($conexion, $consultaDetallesPublicos)) {
            die(json_encode(['error' => 'Error al guardar los detalles públicos: ' . mysqli_error($conexion)]));
        }

        if (!empty($tecnologias)) {
            $tecnologiasQuery = "INSERT INTO tecnologias_dominadas (Candidato_ID, Tecnologia) VALUES ";
            $tecnologiasValues = [];
            foreach ($tecnologias as $tecnologiaId) {
                $tecnologiasValues[] = "('$candidatoId', '$tecnologiaId')";
            }
            $tecnologiasQuery .= implode(', ', $tecnologiasValues);

            if (!mysqli_query($conexion, $tecnologiasQuery)) {
                die(json_encode(['error' => 'Error al guardar las tecnologías dominadas: ' . mysqli_error($conexion)]));
            }
        }

        // Generar token de verificación
        $token = bin2hex(random_bytes(16)); 
        $fechaExpiracion = date('Y-m-d H:i:s', strtotime('+1 hour')); // Expira en 1 hora
        $fechaActual = date('Y-m-d H:i:s');

        $consultaToken = "INSERT INTO verificacion_usuarios (Candidato_ID, Token_Verificacion, Fecha_Expiracion_Token, Correo_Verificado, Fecha_Registro, Fecha_Actualizacion)
        VALUES ('$candidatoId', '$token', '$fechaExpiracion', 0, '$fechaActual', '$fechaActual')";
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
            $mail->Subject = 'TOKEN PARA VERIFICAR CUENTA';
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
