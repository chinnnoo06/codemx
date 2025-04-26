<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idEmpresa = mysqli_real_escape_string($conexion, $_POST['idEmpresa']);

    // Configuración de rutas
    $serverUrl = 'https://codemx.net/codemx/public';
    $logoDirRelativo = '/resources/fotos_perfil_empresas/';  // Corregir aquí
    $logoDir = __DIR__ . '/../../public/resources/fotos_perfil_empresas/';
    $defaultPhoto = $serverUrl . $logoDirRelativo . 'Usuario.png';

    // Validar existencia del directorio
    if (!file_exists($logoDir)) {
        die(json_encode(['error' => 'El directorio para las fotografías no existe.']));
    }

    // Verificar si la empresa existe y obtener la foto actual
    $verificarEmpresa = "SELECT Logo FROM empresa WHERE ID = '$idEmpresa'";
    $resultado = mysqli_query($conexion, $verificarEmpresa);

    if (mysqli_num_rows($resultado) === 0) {
        echo json_encode(['error' => 'Empresa no encontrada.']);
        exit;
    }

    $fila = mysqli_fetch_assoc($resultado);
    $fotoActual = $fila['Logo'];

    // Subida de la nueva fotografía
    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $extension = pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION);

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
            $fotoNumero = count(glob($logoDir . "/perfil*")) + 1;
            $fotoNombre = "perfil{$fotoNumero}.{$extension}";
        }

        // Ruta de almacenamiento
        $fotoRutaRelativa = $logoDirRelativo . $fotoNombre;
        $fotoRutaCompleta = $serverUrl . $fotoRutaRelativa;

        // Mover la nueva foto al servidor
        if (!move_uploaded_file($_FILES['logo']['tmp_name'], $logoDir . $fotoNombre)) {
            echo json_encode(['error' => 'Error al guardar el nuevo logo.']);
            exit;
        }

        // Actualizar la base de datos con la nueva foto
        $actualizarFoto = "UPDATE empresa SET Logo = '$fotoRutaCompleta' WHERE ID = '$idEmpresa'";
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
