<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idEmpresa = mysqli_real_escape_string($conexion, $_POST['empresa_id']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $ocultarMeGusta = mysqli_real_escape_string($conexion, $_POST['ocultar_me_gusta']);
    $sinComentarios = mysqli_real_escape_string($conexion, $_POST['sin_comentarios']);
    $fechaActual = date('Y-m-d H:i:s');

    $serverUrl = 'https://codemx.net/codemx/public';
    $imgDirRelativo = '/resources/publicaciones/';
    $imgDir = realpath(__DIR__ . '/../../public/resources/publicaciones/');

    $imgRutaCompleta = null;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $imgNombre = "publi" . uniqid() . "." . pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
        $imgRutaRelativa = $imgDirRelativo . $imgNombre;
        $imgRutaCompleta = $serverUrl . $imgRutaRelativa;

        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $imgDir . '/' . $imgNombre)) {
            die(json_encode(['error' => 'Error al guardar la imagen de la publicacion.']));
        }
    } else {
        die(json_encode(['error' => 'Falta la imagen']));
    }

    $consulta = "INSERT INTO publicacion (Empresa_ID, Img, Contenido, Ocultar_MeGusta, Sin_Comentarios, Fecha_Publicacion)
        VALUES ('$idEmpresa', '$imgRutaCompleta', '$descripcion', '$ocultarMeGusta', '$sinComentarios', '$fechaActual')";

    if (mysqli_query($conexion, $consulta)) {
        $idPublicacion = mysqli_insert_id($conexion); // <<--- AQUÍ
        echo json_encode([
            'success' => true,
            'message' => 'Publicacion subida correctamente',
            'idPublicacion' => $idPublicacion
        ]);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
