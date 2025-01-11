<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $token = mysqli_real_escape_string($conexion, $_POST['token']);
    $newPassword = mysqli_real_escape_string($conexion, $_POST['newPassword']);
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Obtener la hora actual desde PHP
    $fechaActual = date('Y-m-d H:i:s');

    // Actualizar la contraseña y eliminar el token en una sola consulta
    $actualizarPasswordYEliminarToken = "
        UPDATE candidato AS c 
        JOIN restablecer_contrasenia AS r ON c.ID = r.Candidato_ID AND r.Token = '$token' AND r.Fecha_Expiracion_Token > '$fechaActual'
        SET c.Password = '$hashedPassword'
        WHERE c.Email = '$email'
        
        UNION
        
        UPDATE empresa AS e 
        JOIN restablecer_contrasenia AS r ON e.ID = r.Empresa_ID AND r.Token = '$token' AND r.Fecha_Expiracion_Token > '$fechaActual'
        SET e.Password = '$hashedPassword'
        WHERE e.Email = '$email';

        DELETE FROM restablecer_contrasenia WHERE Token = '$token';
    ";

    if (mysqli_multi_query($conexion, $actualizarPasswordYEliminarToken)) {
        echo json_encode(['success' => 'Contraseña actualizada exitosamente']);
    } else {
        error_log("Error al actualizar la contraseña o eliminar el token: " . mysqli_error($conexion));
        echo json_encode(['error' => 'Error al actualizar la contraseña o eliminar el token']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
