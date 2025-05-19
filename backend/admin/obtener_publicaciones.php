
<?php
require_once '../config/conexion.php';

// Encabezados para CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que las empresas fueron enviadas
    if (!isset($data['page'])) {
        echo json_encode(['error' => 'Faltan datos.']);
        http_response_code(400);
        exit();
    }

    $page = (int)$data['page'];
    $limit = 25;  // Número de post a devolver por página
    $offset = ($page - 1) * $limit; // Calcular el offset según la página

    // Consultas para obtener las publicaciones de las empresas que sigue el candidato
    $queryPublicaciones = "
        SELECT p.ID, p.Empresa_ID, p.Contenido, p.Img, p.Fecha_Publicacion, p.Ocultar_MeGusta, p.Sin_Comentarios, 
               e.Logo AS Empresa_Logo, e.Nombre AS Empresa_Nombre
        FROM publicacion p
        JOIN empresa e ON p.Empresa_ID = e.ID
        ORDER BY p.Fecha_Publicacion DESC
    ";

    // Ejecutar las consultas para obtener publicaciones de empresas seguidas
    $resultado = mysqli_query($conexion, $queryPublicaciones);
    $publicaciones = [];
    while ($row = mysqli_fetch_assoc($resultado)) {
        $publicaciones[] = $row;
    }

    $publicacionesPaginadas = array_slice($publicaciones, $offset, $limit);

    // Si no hay publicaciones
    if (count($publicaciones) === 0) {
        echo json_encode([
            'success' => true,
            'publicaciones' => []
        ]);
        exit();
    }

    echo json_encode([
        'success' => true,
        'publicaciones' => $publicacionesPaginadas
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>