
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
    $limit = 5;  // Número de post a devolver por página
    $offset = ($page - 1) * $limit; // Calcular el offset según la página

    // Consultas para obtener las publicaciones de las empresas que sigue el candidato
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
            vacante.Estado AS Estado_Vacante_ID,
            (SELECT COUNT(*) FROM postulaciones WHERE postulaciones.Vacante_ID = vacante.ID) AS Cantidad_Postulados, 
            empresa.ID AS Empresa_ID,
            empresa.Nombre AS Empresa_Nombre,
            empresa.Logo AS Empresa_Logo
        FROM vacante
        INNER JOIN modalidad_trabajo ON vacante.Modalidad = modalidad_trabajo.ID
        INNER JOIN estado ON vacante.Estado = estado.ID
        INNER JOIN empresa ON vacante.Empresa_ID = empresa.ID
        LEFT JOIN postulaciones ON vacante.ID = postulaciones.Vacante_ID  
        ORDER BY vacante.Fecha_Creacion DESC
    ";

    // Ejecutar las consultas para obtener publicaciones de empresas seguidas
    $resultado = mysqli_query($conexion, $consultaVacantes);
    $vacantes = [];
    while ($row = mysqli_fetch_assoc($resultado)) {
        $vacantes[] = $row;
    }

    $vacantesPaginadas = array_slice($vacantes, $offset, $limit);

    // Si no hay publicaciones
    if (count($vacantes) === 0) {
        echo json_encode([
            'success' => true,
            'vacantes' => []
        ]);
        exit();
    }

    echo json_encode([
        'success' => true,
        'vacantes' => $vacantesPaginadas
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>