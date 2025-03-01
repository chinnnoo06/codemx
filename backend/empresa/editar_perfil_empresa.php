<?php
require_once '../config/conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idEmpresa = mysqli_real_escape_string($conexion, $_POST['idEmpresa']); 
    $nombre = mysqli_real_escape_string($conexion, $_POST['nombre']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $sector = mysqli_real_escape_string($conexion, $_POST['sector']);
    $tamanio = mysqli_real_escape_string($conexion, $_POST['tamanio']);
    $telefono = mysqli_real_escape_string($conexion, $_POST['telefono']);
    $fechaCreacion = mysqli_real_escape_string($conexion, $_POST['fechaCreacion']);
    $passwordActual = mysqli_real_escape_string($conexion, $_POST['passwordActual']); 

    // Obtener la contraseña actual de la empresa en la base de datos
    $verificarEmpresa = "SELECT password FROM empresa WHERE ID = '$idEmpresa'";
    $resultado = mysqli_query($conexion, $verificarEmpresa);

    if (mysqli_num_rows($resultado) > 0) {
        $fila = mysqli_fetch_assoc($resultado);
        $passwordHash = $fila['password'];

        // Verificar que la contraseña actual ingresada sea correcta
        if (password_verify($passwordActual, $passwordHash)) {
            // Actualizar datos de la empresa
            $consultaEmpresa = "
                UPDATE empresa
                SET 
                    Nombre = '$nombre',
                    Descripcion = '$descripcion',
                    Sector = '$sector',
                    Tamanio = '$tamanio',
                    Telefono = '$telefono',
                    Fecha_Creacion = '$fechaCreacion'
                WHERE ID = '$idEmpresa'
            ";

            if (mysqli_query($conexion, $consultaEmpresa)) {
                echo json_encode(['success' => true, 'message' => 'Datos actualizados correctamente.']);
            } else {
                echo json_encode(['error' => 'Error al actualizar los datos: ' . mysqli_error($conexion)]);
            }
        } else {
            echo json_encode(['error' => 'La contraseña actual es incorrecta.']);
        }
    } else {
        echo json_encode(['error' => 'Empresa no encontrada.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
