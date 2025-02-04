<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idPublicacion = mysqli_real_escape_string($conexion, $_POST['publicacion_id']);
    $descripcion = mysqli_real_escape_string($conexion, $_POST['descripcion']);
    $ocultarMeGusta = mysqli_real_escape_string($conexion, $_POST['ocultar_me_gusta']);
    $sinComentarios = mysqli_real_escape_string($conexion, $_POST['sin_comentarios']);
  
    $consulta = "UPDATE publicacion SET Contenido = '$descripcion', Ocultar_MeGusta = '$ocultarMeGusta', Sin_Comentarios = '$sinComentarios' WHERE ID = '$idPublicacion'";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => 'Publicacion editada corrctamente']);
    } else {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
