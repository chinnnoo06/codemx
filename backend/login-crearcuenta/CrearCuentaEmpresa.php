<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $nombre = mysqli_real_escape_string($conexion, $_POST['nombre']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $password = mysqli_real_escape_string($conexion, $_POST['password']);
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $sector = mysqli_real_escape_string($conexion, $_POST['sector']);
    $tamanio = mysqli_real_escape_string($conexion, $_POST['tamanio']);
    $estado = mysqli_real_escape_string($conexion, $_POST['estado']);
    $direccion = mysqli_real_escape_string($conexion, $_POST['direccion']);
    $telefono = mysqli_real_escape_string($conexion, $_POST['telefono']);
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $fechaCreacion = mysqli_real_escape_string($conexion, $_POST['fechaCreacion']);
    $rfc = mysqli_real_escape_string($conexion, $_POST['rfc']);

    // Rutas relativas y absolutas para almacenamiento
    $logoDirRelativo = 'frontend/src/resources/fotos_perfil_empresas/';
    $logoDir = realpath(__DIR__ . '/../../frontend/src/resources/fotos_perfil_empresas/');


    // Validar rutas y crear carpetas si no existen
    if (!$logoDir) {
        die(json_encode(['error' => 'Las rutas para almacenar los archivos no son válidas.']));
    }
    if (!file_exists($logoDir)) mkdir($logoDir, 0777, true);

    // Guardar el logo
    $logoRutaRelativa = null;
    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $logoNumero = count(glob($logoDir . "/perfil*")) + 1;
        $logoNombre = "perfil" . $logoNumero . "." . pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION);
        $logoRutaRelativa = $logoDirRelativo . $logoNombre;
        if (!move_uploaded_file($_FILES['logo']['tmp_name'], $logoDir . '/' . $logoNombre)) {
            die(json_encode(['error' => 'Error al guardar el logo.']));
        }
    } else {
        // Asignar una imagen por defecto si no se subió ninguna fotografía
        $logoRutaRelativa = $logoDirRelativo . 'Usuario.png';
    }

    // Guardar los datos de empresa
    $consultaEmpresa = "INSERT INTO Empresa (Nombre, Password, Descripcion, Sector, Tamanio, Estado , Direccion, Telefono, Email, Fecha_Creacion, RFC, Logo)
        VALUES ('$nombre', '$passwordHash', '$descripcion', '$sector', '$tamanio', '$estado', '$direccion', '$telefono', '$email', '$fechaCreacion', '$rfc', '$logoRutaRelativa')";

    if (mysqli_query($conexion, $consultaEmpresa)) {

        echo json_encode(['success' => 'Registro exitoso.']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
