<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $idCandidato = mysqli_real_escape_string($conexion, $_POST['idCandidato']); 
    $passwordActual = mysqli_real_escape_string($conexion, $_POST['passwordActual']); 
    $passwordNueva = mysqli_real_escape_string($conexion, $_POST['passwordNueva']); 

    // Verificar si el candidato existe
    $verificarCandidato = "SELECT password FROM candidato WHERE ID = '$idCandidato'";
    $resultado = mysqli_query($conexion, $verificarCandidato);

    if (mysqli_num_rows($resultado) > 0) {
        $fila = mysqli_fetch_assoc($resultado);
        $passwordHash = $fila['password'];

        // Verificar que la contraseña actual sea correcta
        if (password_verify($passwordActual, $passwordHash)) {
            // Generar hash de la nueva contraseña
            $passwordNuevaHash = password_hash($passwordNueva, PASSWORD_BCRYPT);

            // Actualizar la contraseña en la base de datos
            $actualizarPassword = "UPDATE candidato SET password = '$passwordNuevaHash' WHERE ID = '$idCandidato'";
            if (mysqli_query($conexion, $actualizarPassword)) {
                echo json_encode(['success' => true, 'message' => 'Contraseña actualizada correctamente.']);
            } else {
                echo json_encode(['error' => 'Error al actualizar la contraseña: ' . mysqli_error($conexion)]);
            }
        } else {
            echo json_encode(['error' => 'La contraseña actual es incorrecta.']);
        }
       
    } else {
        echo json_encode(['error' => 'Candidato no encontrado.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
