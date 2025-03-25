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

    if (!isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID del candidato.']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    // Consulta para obtener las vacantes postuladas
    $consultaPostuladas = "
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
        (SELECT COUNT(*) FROM postulaciones WHERE postulaciones.Vacante_ID = vacante.ID) AS Cantidad_Postulados, 
        empresa.ID AS Empresa_ID,
        empresa.Nombre AS Empresa_Nombre,
        empresa.Logo AS Empresa_Logo
    FROM vacante
    INNER JOIN modalidad_trabajo ON vacante.Modalidad = modalidad_trabajo.ID
    INNER JOIN estado ON vacante.Estado = estado.ID
    INNER JOIN empresa ON vacante.Empresa_ID = empresa.ID
    LEFT JOIN postulaciones ON vacante.ID = postulaciones.Vacante_ID  
    WHERE postulaciones.Candidato_ID = '$idCandidato' 
    GROUP BY vacante.ID
    ";


    $resultadoPostuladas = mysqli_query($conexion, $consultaPostuladas);

    if (!$resultadoPostuladas) {
        echo json_encode(['error' => 'Error en la consulta SQL de Postuladas: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $postuladas = [];
    while ($fila = mysqli_fetch_assoc($resultadoPostuladas)) {
        $postuladas[] = $fila;
    }

    // Consulta para obtener las vacantes guardadas
    $consultaGuardadas = "
        SELECT 
            vacantes_guardadas.Vacante_ID AS ID,
            vacante.Titulo AS Titulo,
            vacante.Descripcion AS Descripcion,
            modalidad_trabajo.Modalidad AS Modalidad_Vacante,
            estado.Nombre AS Estado_Vacante,
            vacante.Ubicacion AS Ubicacion,
            vacante.Fecha_Limite AS Fecha_Limite,
            vacante.Estatus AS Estatus,
            vacante.Fecha_Creacion AS Fecha_Creacion,
            COALESCE(COUNT(postulaciones.ID), 0) AS Cantidad_Postulados,
            empresa.ID AS Empresa_ID,
            empresa.Nombre AS Empresa_Nombre,
            empresa.Logo AS Empresa_Logo
        FROM vacantes_guardadas
        INNER JOIN vacante ON vacantes_guardadas.Vacante_ID = vacante.ID
        INNER JOIN modalidad_trabajo ON vacante.Modalidad = modalidad_trabajo.ID
        INNER JOIN estado ON vacante.Estado = estado.ID
        LEFT JOIN postulaciones ON vacante.ID = postulaciones.Vacante_ID
        INNER JOIN empresa ON vacante.Empresa_ID = empresa.ID
        WHERE vacantes_guardadas.Candidato_ID = '$idCandidato'
        GROUP BY vacante.ID
    ";

    $resultadoGuardadas = mysqli_query($conexion, $consultaGuardadas);

    if (!$resultadoGuardadas) {
        echo json_encode(['error' => 'Error en la consulta SQL de Guardadas: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    $guardadas = [];
    while ($fila = mysqli_fetch_assoc($resultadoGuardadas)) {
        $guardadas[] = $fila;
    }

    // Devolver las vacantes postuladas y guardadas
    echo json_encode([
        'postuladas' => $postuladas,
        'guardadas' => $guardadas
    ]);

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
