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
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idEmpresa'])) {
        echo json_encode(['error' => 'Falta el ID de la empresa.']);
        http_response_code(400); 
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);

    $consultaLikes = "
        SELECT * FROM reacciones
        WHERE Reaccion = 'like' AND Publicacion_ID = '$idPublicacion'
    ";

    $resultadoLikes = mysqli_query($conexion, $consultaLikes);

    if (!$resultadoLikes) {
        echo json_encode(['error' => 'Error en la consulta SQL de likes: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $consultaDislikes = "
        SELECT * FROM reacciones
        WHERE Reaccion = 'dislike' AND Publicacion_ID = '$idPublicacion'
    ";

    $resultadoDislikes = mysqli_query($conexion, $consultaDislikes);

    if (!$resultadoDislikes) {
        echo json_encode(['error' => 'Error en la consulta SQL de dislikes: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $consultaComentarios = "
    SELECT * FROM comentarios
    WHERE Publicacion_ID = '$idPublicacion'
    ";

    $resultadoComentarios = mysqli_query($conexion, $consultaComentarios);

    if (!$resultadoComentarios) {
        echo json_encode(['error' => 'Error en la consulta SQL de comentarios: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

     // Obtener lista de likes
     $listaDeLikes = [];
     while ($fila = mysqli_fetch_assoc($resultadoLikes)) {
         $listaDeLikes[] = $fila;
     }

    // Obtener lista de dislikes
    $listaDeDislikes = [];
    while ($fila = mysqli_fetch_assoc($resultadoDislikes)) {
        $listaDeDislikes[] = $fila;
    }

    // Obtener lista de comentarios
     $listaDeComentarios = [];
     while ($fila = mysqli_fetch_assoc($resultadoComentarios)) {
         $listaDeComentarios [] = $fila;
     }

    $cantidadDeLikes = count($listaDeLikes);
    $cantidadDeDislikes = count($listaDeDislikes);
    $cantidadDeComentarios = count($listaDeComentarios);

    echo json_encode([
        'likes' => $listaDeLikes,
        'cantidadLikes' => $cantidadDeLikes,
        'dislikes' => $listaDeDislikes,
        'CantidadDislikes' => $cantidadDeDislikes,
        'comentarios' => $listaDeDislikes,
        'CantidadComentarios' => $cantidadDeComentarios
    ]);

 

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
