<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $idEmpresa = mysqli_real_escape_string($conexion, $_POST['idEmpresa']); 
    $nombre = mysqli_real_escape_string($conexion, $_POST['nombre']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $sector = mysqli_real_escape_string($conexion, $_POST['sector']);
    $tamanio = mysqli_real_escape_string($conexion, $_POST['tamanio']);
    $telefono = mysqli_real_escape_string($conexion, $_POST['telefono']);
    $fechaCreacion = mysqli_real_escape_string($conexion, $_POST['fechaCreacion']);

    // Verificar si la empresa existe
    $verificarEmpresa = "SELECT * FROM empresa WHERE ID = '$idEmpresa'";
    $resultado = mysqli_query($conexion, $verificarEmpresa);

    if (mysqli_num_rows($resultado) > 0) {
        // Actualizar los datos de la empresa
        $consultaEmpresa = "
            UPDATE empresa
            SET 
                Nombre = '$nombre',
                Descripcion = '$descripcion',
                Sector = '$sector',
                Tamanio = '$tamanio',
                Telefono = '$telefono',
                Fecha_Creacion = '$fechaCreacion',

            WHERE ID = '$idEmpresa'
        ";

        if (mysqli_query($conexion, $consultaEmpresa)) {
            echo json_encode(['success' => true, 'message' => 'Datos actualizados correctamente.']);
        } else {
            echo json_encode(['error' => 'Error al actualizar los datos: ' . mysqli_error($conexion)]);
        }
    } else {
        echo json_encode(['error' => 'Empresa no encontrada.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
