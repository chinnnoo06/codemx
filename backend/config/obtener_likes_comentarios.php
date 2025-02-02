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

// Solo aceptamos solicitudes POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idEmpresa']) || !isset($data['idPublicacion'])) {
        echo json_encode(['error' => 'Falta el ID de la empresa o ID de la publicacion.']);
        http_response_code(400);
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);

    // Consulta para obtener los comentarios a los que el usuario ha dado like
    $consultaLikes = "SELECT Comentario_ID FROM reacciones_comentarios WHERE Empresa_ID = '$idEmpresa' AND Publicacion_ID = '$idPublicacion'";
    $resultadoLikes = mysqli_query($conexion, $consultaLikes);

    if (!$resultadoLikes) {
        echo json_encode(['error' => 'Error en la consulta: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    // Lista de comentarios con like
    $listaLikes = [];
    while ($fila = mysqli_fetch_assoc($resultadoLikes)) {
        $listaLikes[] = $fila['Comentario_ID']; // Guardamos solo los IDs de los comentarios
    }

    // Responder con la lista de comentarios que tienen like del usuario
    echo json_encode([
        'success' => true,
        'likes' => $listaLikes
    ]);

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
