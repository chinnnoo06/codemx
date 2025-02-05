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

    if (!isset($data['idPublicacion'])) {
        echo json_encode(['error' => 'Falta el ID de la publicación.']);
        http_response_code(400); 
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);

    $consultaLikes = "
        SELECT candidato.ID candidato.Nombre, candidato.Apellido, candidato.Fotografia, reacciones.Fecha_Reaccion FROM reacciones
        INNER JOIN candidato ON reacciones.Candidato_ID = candidato.ID
        WHERE Reaccion = 'like' AND Publicacion_ID = '$idPublicacion'
        ORDER BY reacciones.Fecha_Reaccion DESC
    ";

    $resultadoLikes = mysqli_query($conexion, $consultaLikes);

    if (!$resultadoLikes) {
        echo json_encode(['error' => 'Error en la consulta SQL de likes: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $consultaDislikes = "
        SELECT candidato.ID candidato.Nombre, candidato.Apellido, candidato.Fotografia, reacciones.Fecha_Reaccion FROM reacciones
        INNER JOIN candidato ON reacciones.Candidato_ID = candidato.ID
        WHERE Reaccion = 'dislike' AND Publicacion_ID = '$idPublicacion'
        ORDER BY reacciones.Fecha_Reaccion DESC
    ";

    $resultadoDislikes = mysqli_query($conexion, $consultaDislikes);

    if (!$resultadoDislikes) {
        echo json_encode(['error' => 'Error en la consulta SQL de dislikes: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $consultaComentarios = "
        SELECT 
            comentarios.ID,
            comentarios.Publicacion_ID,
            comentarios.Comentario,
            comentarios.Fecha_Comentario,
            comentarios.Respuesta_a,
            candidato.ID AS CandidatoID,
            candidato.Nombre AS CandidatoNombre,
            candidato.Apellido AS CandidatoApellido,
            candidato.Fotografia AS CandidatoFotografia,
            empresa.ID AS EmpresaID,
            empresa.Nombre AS EmpresaNombre,
            empresa.Logo AS EmpresaLogo,
            COUNT(reacciones_comentarios.ID) AS NumLikes, 
            MAX(CASE 
                WHEN reacciones_comentarios.Candidato_ID = '$idUsuario' OR reacciones_comentarios.Empresa_ID = '$idUsuario' THEN 1
                ELSE 0 
            END) AS UsuarioDioLike, 
            CASE 
                WHEN comentarios.Candidato_ID IS NOT NULL THEN 'candidato'
                WHEN comentarios.Empresa_ID IS NOT NULL THEN 'empresa'
                ELSE NULL 
            END AS tipo_usuario
        FROM comentarios
        LEFT JOIN candidato ON comentarios.Candidato_ID = candidato.ID
        LEFT JOIN empresa ON comentarios.Empresa_ID = empresa.ID
        LEFT JOIN reacciones_comentarios 
            ON comentarios.ID = reacciones_comentarios.Comentario_ID
        WHERE comentarios.Publicacion_ID = '$idPublicacion'
        GROUP BY comentarios.ID  
        ORDER BY NumLikes DESC, comentarios.Fecha_Comentario DESC
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
        'cantidadDislikes' => $cantidadDeDislikes,
        'comentarios' => $listaDeComentarios,
        'cantidadComentarios' => $cantidadDeComentarios
    ]);

 

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
