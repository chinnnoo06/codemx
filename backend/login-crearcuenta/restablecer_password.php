<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $token = mysqli_real_escape_string($conexion, $_POST['token']);
    $newPassword = mysqli_real_escape_string($conexion, $_POST['newPassword']);
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Obtener el ID del usuario basado en el token
    $consultaUsuario = "
        SELECT Candidato_ID, Empresa_ID 
        FROM restablecer_contrasenia 
        WHERE Token = '$token'
    ";
    $resultadoUsuario = mysqli_query($conexion, $consultaUsuario);

    if ($resultadoUsuario && mysqli_num_rows($resultadoUsuario) > 0) {
        $fila = mysqli_fetch_assoc($resultadoUsuario);
        $candidatoId = $fila['Candidato_ID'];
        $empresaId = $fila['Empresa_ID'];

        $actualizado = false;

        // Actualizar contraseña según el tipo de usuario
        if (!is_null($candidatoId)) {
            $actualizarCandidato = "
                UPDATE candidato 
                SET Password = '$hashedPassword' 
                WHERE ID = '$candidatoId' AND Email = '$email';
            ";
            $actualizado = mysqli_query($conexion, $actualizarCandidato);
        } elseif (!is_null($empresaId)) {
            $actualizarEmpresa = "
                UPDATE empresa 
                SET Password = '$hashedPassword' 
                WHERE ID = '$empresaId' AND Email = '$email';
            ";
            $actualizado = mysqli_query($conexion, $actualizarEmpresa);
        }

        // Eliminar el token si la contraseña se actualizó correctamente
        if ($actualizado) {
            $eliminarToken = "DELETE FROM restablecer_contrasenia WHERE Token = '$token';";
            mysqli_query($conexion, $eliminarToken); // No necesitamos verificar el resultado aquí
            echo json_encode(['success' => 'Contraseña actualizada exitosamente']);
        } else {
            echo json_encode(['error' => 'Error al actualizar la contraseña']);
        }
    } else {
        echo json_encode(['error' => 'Token no válido o usuario no encontrado']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
