<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $idCandidato = mysqli_real_escape_string($conexion, $_POST['idCandidato']); 
    $nombre = mysqli_real_escape_string($conexion, $_POST['nombre']);
    $apellido = mysqli_real_escape_string($conexion, $_POST['apellido']);
    $fechaNacimiento = mysqli_real_escape_string($conexion, $_POST['fechaNacimiento']);
    $telefono = mysqli_real_escape_string($conexion, $_POST['telefono']);
    $estado = mysqli_real_escape_string($conexion, $_POST['estado']);
    $direccion = mysqli_real_escape_string($conexion, $_POST['direccion']);
    $sexo = mysqli_real_escape_string($conexion, $_POST['sexo']);
    $universidad = mysqli_real_escape_string($conexion, $_POST['universidad']);
    $tiempoRestante = mysqli_real_escape_string($conexion, $_POST['tiempoRestante']);
    $modalidadTrabajo = mysqli_real_escape_string($conexion, $_POST['modalidadTrabajo']);

    // Verificar si el candidato existe
    $verificarCandidato = "SELECT * FROM candidato WHERE id = '$idCandidato'";
    $resultado = mysqli_query($conexion, $verificarCandidato);

    if (mysqli_num_rows($resultado) > 0) {
        // Actualizar los datos del candidato
        $consultaCandidato = "
            UPDATE candidato
            SET 
                Nombre = '$nombre',
                Apellido = '$apellido',
                Fecha_Nacimiento = '$fechaNacimiento',
                Telefono = '$telefono',
                Estado = '$estado',
                Direccion = '$direccion',
                Sexo = '$sexo',
                Universidad = '$universidad',
                Tiempo_Restante = '$tiempoRestante',
                Modalidad_Trabajo = '$modalidadTrabajo'
            WHERE id = '$idCandidato'
        ";

        if (mysqli_query($conexion, $consultaCandidato)) {
            echo json_encode(['success' => true, 'message' => 'Datos actualizados correctamente.']);
        } else {
            echo json_encode(['error' => 'Error al actualizar los datos: ' . mysqli_error($conexion)]);
        }
    } else {
        echo json_encode(['error' => 'Candidato no encontrado.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
