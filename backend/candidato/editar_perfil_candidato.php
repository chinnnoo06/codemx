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

    // Dominio del servidor
    $serverUrl = 'https://codemx.net/codemx/public';

    // Rutas relativas y absolutas para almacenamiento
    $cvDirRelativo = '/resources/cv/';
    $cvDir = __DIR__ . '/../../public/resources/cv/';

    // Validar rutas
    if (!file_exists($cvDir)) {
        die(json_encode(['error' => 'El directorio para los CV no existe.']));
    }

    // Verificar si el candidato existe
    $verificarCandidato = "SELECT * FROM candidato WHERE ID = '$idCandidato'";
    $resultado = mysqli_query($conexion, $verificarCandidato);


    $fila = mysqli_fetch_assoc($resultado);
    $cvActual = $fila['CV'];

    // Guardar el nuevo currículum
    if (isset($_FILES['cv']) && $_FILES['cv']['error'] === UPLOAD_ERR_OK) {
        // Eliminar el archivo existente, si aplica
        if ($cvActual && strpos($cvActual, 'curriculum') !== false) {
            $cvActualPath = str_replace($serverUrl, __DIR__ . '/../../public', $cvActual);
            if (file_exists($cvActualPath)) {
                unlink($cvActualPath);
            }
        }

        // Generar nombre único para el nuevo archivo si no existe un CV previo
        if (!$cvActual) {
            $cvNumero = count(glob($cvDir . "curriculum*")) + 1;
            $cvNombre = "curriculum" . $cvNumero . "." . pathinfo($_FILES['cv']['name'], PATHINFO_EXTENSION);
        } else {
            // Mantener el mismo nombre si ya existía un CV
            $cvNombre = basename($cvActual);
        }

        $cvRutaRelativa = $cvDirRelativo . $cvNombre;
        $cvRutaCompleta = $serverUrl . $cvRutaRelativa;

        if (!move_uploaded_file($_FILES['cv']['tmp_name'], $cvDir . $cvNombre)) {
            die(json_encode(['error' => 'Error al guardar el currículum.']));
        }

        // Actualizar la base de datos con la nueva ruta
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
                Modalidad_Trabajo = '$modalidadTrabajo',
                CV = '$cvRutaCompleta'
            WHERE ID = '$idCandidato'
        ";

        if (mysqli_query($conexion, $consultaCandidato)) {
            echo json_encode(['success' => true, 'message' => 'Datos actualizados correctamente.']);
        } else {
            echo json_encode(['error' => 'Error al actualizar los datos: ' . mysqli_error($conexion)]);
        }
    } else {
        echo json_encode(['error' => 'No se recibió ningún archivo.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
