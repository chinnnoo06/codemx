<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idCandidato = mysqli_real_escape_string($conexion, $_POST['idCandidato']);

    // Configuración de rutas
    $serverUrl = 'https://codemx.net/codemx/public';
    $fotografiaDirRelativo = '/resources/fotos_perfil_candidatos/';
    $fotografiaDir = __DIR__ . '/../../public/resources/fotos_perfil_candidatos/';
    $defaultPhoto = $serverUrl . $fotografiaDirRelativo . 'Usuario.png';

    // Validar existencia del directorio
    if (!file_exists($fotografiaDir)) {
        die(json_encode(['error' => 'El directorio para las fotografías no existe.']));
    }

    // Verificar si el candidato existe y obtener la foto actual
    $verificarCandidato = "SELECT Fotografia FROM candidato WHERE ID = '$idCandidato'";
    $resultado = mysqli_query($conexion, $verificarCandidato);

    if (mysqli_num_rows($resultado) === 0) {
        echo json_encode(['error' => 'Candidato no encontrado.']);
        exit;
    }

    $fila = mysqli_fetch_assoc($resultado);
    $fotoActual = $fila['Fotografia'];

    // Subida de la nueva fotografía
    if (isset($_FILES['fotografia']) && $_FILES['fotografia']['error'] === UPLOAD_ERR_OK) {
        $extension = pathinfo($_FILES['fotografia']['name'], PATHINFO_EXTENSION);

        if ($fotoActual !== $defaultPhoto) {
            // Eliminar la foto anterior si no es la predeterminada
            $fotoActualPath = str_replace($serverUrl, __DIR__ . '/../../public', $fotoActual);
            if (file_exists($fotoActualPath)) {
                unlink($fotoActualPath);
            }

            // Mantener el mismo nombre que la foto anterior
            $fotoNombre = basename($fotoActual);
        } else {
            // Asignar un nuevo nombre
            $fotoNumero = count(glob($fotografiaDir . "/perfil*")) + 1;
            $fotoNombre = "perfil{$fotoNumero}.{$extension}";
        }

        // Ruta de almacenamiento
        $fotoRutaRelativa = $fotografiaDirRelativo . $fotoNombre;
        $fotoRutaCompleta = $serverUrl . $fotoRutaRelativa;

        // Mover la nueva foto al servidor
        if (!move_uploaded_file($_FILES['fotografia']['tmp_name'], $fotografiaDir . $fotoNombre)) {
            echo json_encode(['error' => 'Error al guardar la nueva fotografía.']);
            exit;
        }

        // Actualizar la base de datos con la nueva foto
        $actualizarFoto = "UPDATE candidato SET Fotografia = '$fotoRutaCompleta' WHERE ID = '$idCandidato'";
        if (mysqli_query($conexion, $actualizarFoto)) {
            echo json_encode(['success' => true, 'fotografiaActualizada' => $fotoRutaCompleta]);
        } else {
            echo json_encode(['error' => 'Error al actualizar la base de datos: ' . mysqli_error($conexion)]);
        }
    } else {
        echo json_encode(['error' => 'No se recibió ninguna fotografía válida.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
