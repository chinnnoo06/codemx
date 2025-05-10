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

    $consulta = " SELECT ID, Empresa_ID, Img, Contenido, Ocultar_MeGusta, Sin_Comentarios, Fecha_Publicacion, empresa.Logo AS Empresa_Logo, empresa.Nombre AS Empresa_Nombre FROM publicacion
        INNER JOIN empresa ON publicacion.ID = Empresa_ID
        WHERE Empresa_ID = '$idEmpresa'
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

        $cantidadDePunlicaciones = count($listaDePublicaciones);

        echo json_encode([
            'cantidad' => $cantidadDePunlicaciones,
            'publicaciones' => $listaDePublicaciones
        ]);
    } else {
        echo json_encode(['cantidad' => 0, 'empresas' => [], 'error' => 'La empresa no tiene publicaciones.']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
