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

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);

    // Modificando la consulta para incluir los campos de la tabla empresa
    $consulta = " 
        SELECT publicacion.ID, publicacion.Empresa_ID, publicacion.Img, publicacion.Contenido, 
               publicacion.Ocultar_MeGusta, publicacion.Sin_Comentarios, publicacion.Fecha_Publicacion, 
               empresa.Logo AS Empresa_Logo, empresa.Nombre AS Empresa_Nombre 
        FROM publicacion
        INNER JOIN empresa ON publicacion.Empresa_ID = empresa.ID
        WHERE publicacion.Empresa_ID = '$idEmpresa'
    ";

    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    if (mysqli_num_rows($resultado) > 0) {
        $listaDePublicaciones = [];
        while ($fila = mysqli_fetch_assoc($resultado)) {
            $listaDePublicaciones[] = $fila;
        }

        $cantidadDePublicaciones = count($listaDePublicaciones);

        echo json_encode([
            'cantidad' => $cantidadDePublicaciones,
            'publicaciones' => $listaDePublicaciones
        ]);
    } else {
        echo json_encode(['cantidad' => 0, 'publicaciones' => [], 'error' => 'La empresa no tiene publicaciones.']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
