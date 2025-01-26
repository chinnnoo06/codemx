<?php
require_once '../config/conexion.php';

// Encabezados para habilitar CORS
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
    $idEmpresa = mysqli_real_escape_string($conexion, $_POST['empresa_id']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $ocultarMeGusta = mysqli_real_escape_string($conexion, $_POST['ocultar_me_gusta']);
    $sinComentarios = mysqli_real_escape_string($conexion, $_POST['sin_comentarios']);

    // Dominio del servidor
    $serverUrl = 'https://codemx.net/codemx/public';

    // Rutas relativas y absolutas para almacenamiento
    $imgDirRelativo = '/resources/publicaciones/';
    $imgDir = realpath(__DIR__ . '/../../public/resources/publicaciones/');

    // Guardar img de la publicacion
    $imgRutaCompleta = null;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $imgNumero = count(glob($imgDir . "/publi*")) + 1;
        $imgNombre = "publi" . $imgNumero . "." . pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
        $imgRutaRelativa = $imgDirRelativo . $imgNombre;
        $imgRutaCompleta = $serverUrl . $imgRutaRelativa;
        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $imgDir . '/' . $imgNombre)) {
            die(json_encode(['error' => 'Error al guardar la imagen de la publicacion.']));
        }
    } else {
        die(json_encode(['error' => 'Falta la imagen']));
    }
  
    $consulta = "INSERT INTO publicacion (Empresa_ID, Img, Contenido, Ocultar_MeGusta, Sin_Comentarios)
        VALUES ('$idEmpresa', '$imgRutaCompleta', '$descripcion', '$ocultarMeGusta', '$sinComentarios')";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => 'Publicacion subida corrctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
