<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $token = mysqli_real_escape_string($conexion, $_POST['token']);
    $newPassword = mysqli_real_escape_string($conexion, $_POST['newPassword']);
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    $consultaToken = "
        SELECT * 
        FROM restablecer_contrasenia 
        WHERE Token = '$token' 
        AND (
            Candidato_ID = (SELECT ID FROM candidato WHERE Email = '$email')  
            OR Empresa_ID = (SELECT ID FROM empresa WHERE Email = '$email')
        )
    ";
    $resultado = mysqli_query($conexion, $consultaToken);


    if (mysqli_num_rows($resultado) > 0) {
        // Determinar el tipo de usuario (Candidato o Empresa)
        $row = mysqli_fetch_assoc($resultado);
        if (!empty($row['Candidato_ID'])) {
            $actualizarPassword = "UPDATE candidato SET Password = '$hashedPassword' WHERE Email = '$email'";
        } else {
            $actualizarPassword = "UPDATE empresa SET Password = '$hashedPassword' WHERE Email = '$email'";
        }

        if (mysqli_query($conexion, $actualizarPassword)) {
            // Eliminar el token después de usarlo
            $eliminarToken = "DELETE FROM restablecer_contrasenia WHERE Token = '$token'";
            mysqli_query($conexion, $eliminarToken);
            // Eliminar tokens caducados automáticamente
            $fechaActual = date('Y-m-d H:i:s');
            $consultaEliminar = "DELETE FROM restablecer_contrasenia WHERE Fecha_Expiracion_Token <= '$fechaActual'";
            mysqli_query($conexion, $consultaEliminar);


            echo json_encode(['success' => 'Contraseña actualizada exitosamente']);
        } else {
            echo json_encode(['error' => 'Error al actualizar la contraseña: ' . mysqli_error($conexion)]);
        }
    } else {
        echo json_encode(['error' => 'Token inválido o expirado']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>