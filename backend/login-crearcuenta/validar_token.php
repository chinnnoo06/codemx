<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $token = mysqli_real_escape_string($conexion, $_POST['token']);

    $fechaActual = date('Y-m-d H:i:s');

    // Verificar si el token existe en la tabla restablecer_contrasenia
    $consultaToken = "
        SELECT * 
        FROM restablecer_contrasenia 
        WHERE Token = '$token' 
        AND Fecha_Expiracion_Token > '$fechaActual'
        AND (
            Candidato_ID = (SELECT ID FROM candidato WHERE Email = '$email') 
            OR Empresa_ID = (SELECT ID FROM empresa WHERE Email = '$email')
        )
    ";
    $resultado = mysqli_query($conexion, $consultaToken);

    if (mysqli_num_rows($resultado) > 0) {
        echo json_encode(['success' => 'Token válido']);
    } else {
        echo json_encode(['error' => 'Token inválido o expirado']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
