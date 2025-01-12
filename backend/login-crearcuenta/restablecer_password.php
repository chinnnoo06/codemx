<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $token = mysqli_real_escape_string($conexion, $_POST['token']);
    $newPassword = mysqli_real_escape_string($conexion, $_POST['newPassword']);
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Obtener la hora actual desde PHP
    $fechaActual = date('Y-m-d H:i:s');

    $consultaToken = "
        SELECT * 
        FROM restablecer_contrasenia 
    ";
    $resultado = mysqli_query($conexion, $consultaToken);


    if (mysqli_num_rows($resultado) > 0) {
        echo json_encode(['success' => 'ok']);
    } else {
        echo json_encode(['error' => 'Token inválido o expirado']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>