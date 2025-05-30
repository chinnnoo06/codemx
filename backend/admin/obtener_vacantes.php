<?php
require_once '../config/conexion.php';

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

    if (!isset($data['page'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el número de página.']);
        http_response_code(400);
        exit();
    }

    $page = (int)$data['page'];
    $limit = 10;
    $offset = ($page - 1) * $limit;

    $consultaVacantes = "
        SELECT 
            vacante.ID AS ID,
            vacante.Titulo AS Titulo,
            vacante.Descripcion AS Descripcion,
            modalidad_trabajo.Modalidad AS Modalidad_Vacante,
            estado.Nombre AS Estado_Vacante,
            vacante.Ubicacion AS Ubicacion,
            vacante.Fecha_Limite AS Fecha_Limite,
            vacante.Estatus AS Estatus,
            vacante.Fecha_Creacion AS Fecha_Creacion,
            empresa.ID AS Empresa_ID,
            empresa.Nombre AS Empresa_Nombre,
            empresa.Logo AS Empresa_Logo,
            empresa.Email AS Empresa_Email,
            (SELECT COUNT(*) FROM postulaciones WHERE postulaciones.Vacante_ID = vacante.ID) AS Cantidad_Postulados
        FROM vacante
        INNER JOIN modalidad_trabajo ON vacante.Modalidad = modalidad_trabajo.ID
        INNER JOIN estado ON vacante.Estado = estado.ID
        INNER JOIN empresa ON vacante.Empresa_ID = empresa.ID
        WHERE vacante.Estatus = 'activa'
        ORDER BY vacante.Fecha_Creacion DESC
        LIMIT $limit OFFSET $offset
    ";

    $resultado = mysqli_query($conexion, $consultaVacantes);
    $vacantes = [];

    while ($fila = mysqli_fetch_assoc($resultado)) {
        $vacantes[] = $fila;
    }

    echo json_encode([
        'success' => true,
        'vacantes' => $vacantes
    ]);
    exit();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
    exit();
}
?>
