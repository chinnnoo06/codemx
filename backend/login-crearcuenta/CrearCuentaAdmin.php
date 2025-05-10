<?php
require_once '../config/conexion.php';
require_once '../env_loader.php'; // Ruta al cargador de variables de entorno
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $nombre = mysqli_real_escape_string($conexion, $_POST['nombre']);
    $apellido = mysqli_real_escape_string($conexion, $_POST['apellido']);
    $password = mysqli_real_escape_string($conexion, $_POST['password']);
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $email = mysqli_real_escape_string($conexion, $_POST['email']);

    // Corregir la consulta SQL: quitar la coma extra al final de los valores
    $consultaCandidato = "INSERT INTO administrador (Nombre, Apellido, Email, Password)
                          VALUES ('$nombre', '$apellido', '$email', '$passwordHash')";

    if (mysqli_query($conexion, $consultaCandidato)) {
        echo json_encode(['success' => 'Registro exitoso.']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
