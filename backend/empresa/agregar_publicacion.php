<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recibir los datos enviados
    $idEmpresa = mysqli_real_escape_string($conexion, $_POST['empresa_id']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $ocultarMeGusta = mysqli_real_escape_string($conexion, $_POST['ocultar_me_gusta']);
    $sinComentarios = mysqli_real_escape_string($conexion, $_POST['sin_comentarios']);
    $fechaActual = date('Y-m-d H:i:s');

    // Dominio del servidor
    $serverUrl = 'https://codemx.net/codemx/public';

    // Rutas relativas y absolutas para almacenamiento
    $imgDirRelativo = '/resources/publicaciones/';
    $imgDir = realpath(__DIR__ . '/../../public/resources/publicaciones/');

    // Verificar si la imagen fue subida correctamente
    $imgRutaCompleta = null;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        // Generar un identificador único para el nombre de la imagen
        $imgNombre = "publi" . uniqid() . "." . pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
        $imgRutaRelativa = $imgDirRelativo . $imgNombre;
        $imgRutaCompleta = $serverUrl . $imgRutaRelativa;

        // Mover la imagen al directorio de almacenamiento
        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $imgDir . '/' . $imgNombre)) {
            die(json_encode(['error' => 'Error al guardar la imagen de la publicacion.']));
        }
    } else {
        die(json_encode(['error' => 'Falta la imagen']));
    }

    // Insertar los datos de la publicación en la base de datos
    $consulta = "INSERT INTO publicacion (Empresa_ID, Img, Contenido, Ocultar_MeGusta, Sin_Comentarios, Fecha_Publicacion)
        VALUES ('$idEmpresa', '$imgRutaCompleta', '$descripcion', '$ocultarMeGusta', '$sinComentarios', '$fechaActual')";

    // Verificar si la consulta se ejecutó correctamente
    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => 'Publicacion subida correctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }

} else {
    // Si la solicitud no es POST, devolver un error 405
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
