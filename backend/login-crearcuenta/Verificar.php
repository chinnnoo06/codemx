<?php
require_once '../config/conexion.php';

if (isset($_GET['token'])) {
    $token = mysqli_real_escape_string($conexion, $_GET['token']);
    echo "Token recibido: $token<br>";

    // Consulta para verificar el token
    $consulta = "SELECT * FROM verificacion_usuarios WHERE Token_Verificacion = '$token' AND Correo_Verificado = 0 AND Fecha_Expiracion_Token > NOW()";
    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        die('Error en la consulta SQL: ' . mysqli_error($conexion));
    }

    if (mysqli_num_rows($resultado) > 0) {
        $row = mysqli_fetch_assoc($resultado);
        $candidatoId = $row['Candidato_ID'];
        echo "Candidato ID: $candidatoId<br>";

        // Actualizar el estado de verificación
        $update = "UPDATE verificacion_usuarios SET Correo_Verificado = 1 WHERE Candidato_ID = '$candidatoId'";
        if (mysqli_query($conexion, $update)) {

            // Redirigir al usuario a la página de inicio de sesión
            header('Location: https://codemx.net/codemx/frontend/build/iniciar-sesion'); 
            exit();
        } else {
            die('Error al verificar la cuenta: ' . mysqli_error($conexion));
        }
    } else {
        echo 'El token es inválido o ha expirado.';
    }
} else {
    echo 'No se proporcionó un token válido.';
}
