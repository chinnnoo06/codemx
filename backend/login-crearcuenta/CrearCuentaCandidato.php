<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $nombre = mysqli_real_escape_string($conexion, $_POST['nombre']);
    $apellido = mysqli_real_escape_string($conexion, $_POST['apellido']);
    $password = mysqli_real_escape_string($conexion, $_POST['password']);
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $fechaNacimiento = mysqli_real_escape_string($conexion, $_POST['fechaNacimiento']);
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $telefono = mysqli_real_escape_string($conexion, $_POST['telefono']);
    $estado = mysqli_real_escape_string($conexion, $_POST['estado']);
    $direccion = mysqli_real_escape_string($conexion, $_POST['direccion']);
    $sexo = mysqli_real_escape_string($conexion, $_POST['sexo']);
    $universidad = mysqli_real_escape_string($conexion, $_POST['universidad']);
    $tiempoRestante = mysqli_real_escape_string($conexion, $_POST['tiempoRestante']);
    $modalidadTrabajo = mysqli_real_escape_string($conexion, $_POST['modalidadTrabajo']);

    $tecnologias = json_decode($_POST['tecnologias'], true); // Decodificar tecnologías del JSON enviado

    // Rutas relativas y absolutas para almacenamiento
    $fotografiaDirRelativo = 'frontend/src/resources/fotos_perfil_candidatos/';
    $curriculumDirRelativo = 'frontend/src/resources/cv/';
    $fotografiaDir = realpath(__DIR__ . '/../../frontend/src/resources/fotos_perfil_candidatos/');
    $curriculumDir = realpath(__DIR__ . '/../../frontend/src/resources/cv/');

    // Validar rutas y crear carpetas si no existen
    if (!$fotografiaDir || !$curriculumDir) {
        die(json_encode(['error' => 'Las rutas para almacenar los archivos no son válidas.']));
    }
    if (!file_exists($fotografiaDir)) mkdir($fotografiaDir, 0777, true);
    if (!file_exists($curriculumDir)) mkdir($curriculumDir, 0777, true);

    // Guardar la fotografía
    $fotoRutaRelativa = null;
    if (isset($_FILES['fotografia']) && $_FILES['fotografia']['error'] === UPLOAD_ERR_OK) {
        $fotoNumero = count(glob($fotografiaDir . "/perfil*")) + 1;
        $fotoNombre = "perfil" . $fotoNumero . "." . pathinfo($_FILES['fotografia']['name'], PATHINFO_EXTENSION);
        $fotoRutaRelativa = $fotografiaDirRelativo . $fotoNombre;
        if (!move_uploaded_file($_FILES['fotografia']['tmp_name'], $fotografiaDir . '/' . $fotoNombre)) {
            die(json_encode(['error' => 'Error al guardar la fotografía.']));
        }
    } else {
        // Asignar una imagen por defecto si no se subió ninguna fotografía
        $fotoRutaRelativa = $fotografiaDirRelativo . 'Usuario.png';
    }

    // Guardar el currículum
    $cvRutaRelativa = null;
    if (isset($_FILES['curriculum']) && $_FILES['curriculum']['error'] === UPLOAD_ERR_OK) {
        $cvNumero = count(glob($curriculumDir . "/curriculum*")) + 1;
        $cvNombre = "curriculum" . $cvNumero . "." . pathinfo($_FILES['curriculum']['name'], PATHINFO_EXTENSION);
        $cvRutaRelativa = $curriculumDirRelativo . $cvNombre;
        if (!move_uploaded_file($_FILES['curriculum']['tmp_name'], $curriculumDir . '/' . $cvNombre)) {
            die(json_encode(['error' => 'Error al guardar el currículum.']));
        }
    }

    // Guardar los datos del candidato
    $consultaCandidato = "INSERT INTO candidato (Nombre, Apellido, Password, Fecha_Nacimiento, Email, Telefono, Estado, Direccion, Sexo, Universidad, Tiempo_Restante, Modalidad_Trabajo, Fotografia, CV)
        VALUES ('$nombre', '$apellido', '$passwordHash', '$fechaNacimiento', '$email', '$telefono', '$estado', '$direccion', '$sexo', '$universidad', '$tiempoRestante', '$modalidadTrabajo', '$fotoRutaRelativa', '$cvRutaRelativa')";

    if (mysqli_query($conexion, $consultaCandidato)) {
        $candidatoId = mysqli_insert_id($conexion); // Obtener el ID del candidato recién creado

        // Insertar tecnologías dominadas
        if (!empty($tecnologias)) {
            $tecnologiasQuery = "INSERT INTO Tecnologias_dominadas (Candidato_ID, Tecnologia) VALUES ";
            $tecnologiasValues = [];
            foreach ($tecnologias as $tecnologiaId) {
                $tecnologiasValues[] = "('$candidatoId', '$tecnologiaId')";
            }
            $tecnologiasQuery .= implode(', ', $tecnologiasValues);

            if (!mysqli_query($conexion, $tecnologiasQuery)) {
                die(json_encode(['error' => 'Error al guardar las tecnologías dominadas: ' . mysqli_error($conexion)]));
            }
        }

        echo json_encode(['success' => 'Registro exitoso.']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
