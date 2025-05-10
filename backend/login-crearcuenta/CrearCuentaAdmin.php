<?php

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
    $email = mysqli_real_escape_string($conexion, $_POST['email']);

  $consultaCandidato = "INSERT INTO administrador (Nombre, Apellido, Email, Password,)
        VALUES ('$nombre', '$apellido', '$passwordHash','$email')";

    if (mysqli_query($conexion, $consultaCandidato)) {
        echo json_encode(['success' => 'Registro exitoso. Correo de verificación enviado.']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }


} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
