<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $idCandidato = mysqli_real_escape_string($conexion, $_POST['idCandidato']);

    // Dominio del servidor
    $serverUrl = 'https://codemx.net/codemx/public';

    // Rutas relativas y absolutas para almacenamiento
    $cvDirRelativo = '/resources/cv/';
    $cvDir = __DIR__ . '/../../public/resources/cv/';

    // Validar rutas
    if (!file_exists($cvDir)) {
        die(json_encode(['error' => 'El directorio para los CV no existe.']));
    }

    // Verificar si el candidato existe y obtener el CV actual
    $verificarCandidato = "SELECT CV FROM candidato WHERE ID = '$idCandidato'";
    $resultado = mysqli_query($conexion, $verificarCandidato);

    if (mysqli_num_rows($resultado) === 0) {
        echo json_encode(['error' => 'Candidato no encontrado.']);
        exit;
    }

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
        $actualizarCandidato = "UPDATE candidato SET CV = '$cvRutaCompleta' WHERE ID = '$idCandidato'";
        if (mysqli_query($conexion, $actualizarCandidato)) {
            echo json_encode(['success' => true, 'cv' => $cvRutaCompleta, 'message' => 'CV actualizado correctamente.']);
        } else {
            echo json_encode(['error' => 'Error al actualizar la base de datos: ' . mysqli_error($conexion)]);
        }
    } else {
        echo json_encode(['error' => 'No se recibió ningún archivo.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
