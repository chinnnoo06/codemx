<?php
require_once '../config/conexion.php';

// Configuración de CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejo del método OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    // Obtener datos actuales
    $consultaCandidato = "SELECT CV FROM candidato WHERE ID = '$idCandidato'";
    $resultado = mysqli_query($conexion, $consultaCandidato);
    $fila = mysqli_fetch_assoc($resultado);
    $cvActual = $fila['CV'];

    // Procesar archivo si se sube
    if (!empty($_FILES['curriculum']['name']) && $_FILES['curriculum']['error'] === UPLOAD_ERR_OK) {
        $cvDir = __DIR__ . '/../../public/resources/cv/';
        $serverUrl = 'https://codemx.net/codemx/public/resources/cv/';
        
        if (!file_exists($cvDir)) {
            die(json_encode(['error' => 'El directorio para los CV no existe.']));
        }

        // Si ya existe un CV previo, eliminarlo
        if ($cvActual) {
            $cvActualPath = str_replace($serverUrl, $cvDir, $cvActual);
            if (file_exists($cvActualPath)) {
                unlink($cvActualPath);
            }
        }

        // Guardar nuevo archivo con nombre único
        $cvNombre = "curriculum_" . time() . "." . pathinfo($_FILES['curriculum']['name'], PATHINFO_EXTENSION);
        $cvRutaCompleta = $serverUrl . $cvNombre;
        if (!move_uploaded_file($_FILES['curriculum']['tmp_name'], $cvDir . $cvNombre)) {
            die(json_encode(['error' => 'Error al guardar el currículum.']));
        }
    } else {
        $cvRutaCompleta = $cvActual; // Mantener el CV actual si no se subió uno nuevo
    }

    // Actualizar datos
    $query = "UPDATE candidato SET 
        Nombre = '$nombre',
        Apellido = '$apellido',
        Fecha_Nacimiento = '$fechaNacimiento',
        Telefono = '$telefono',
        Estado = '$estado',
        Direccion = '$direccion',
        Sexo = '$sexo',
        Universidad = '$universidad',
        Tiempo_Restante = '$tiempoRestante',
        Modalidad_Trabajo = '$modalidadTrabajo'";

    // Solo actualizar el CV si se subió un archivo
    if ($cvRutaCompleta !== $cvActual) {
        $query .= ", CV = '$cvRutaCompleta'";
    }

    $query .= " WHERE ID = '$idCandidato'";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true, 'message' => 'Datos actualizados correctamente.']);
    } else {
        echo json_encode(['error' => 'Error al actualizar los datos: ' . mysqli_error($conexion)]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}

?>
