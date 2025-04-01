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

    if (!isset($data['idVacante'])) {
        echo json_encode(['error' => 'Falta el ID de la vacante.']);
        http_response_code(400); 
        exit();
    }

    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);

    $consulta = "
        SELECT candidato.ID, candidato.Nombre, candidato.Apellido, candidato.Fotografia, universidad.Nombre AS Universidad, postulaciones.Fecha_Postulacion
        FROM postulaciones
        INNER JOIN candidato ON postulaciones.Candidato_ID = candidato.ID
        INNER JOIN universidad ON candidato.Universidad = universidad.ID 
        WHERE postulaciones.Vacante_ID = '$idVacante'
        ORDER BY postulaciones.Fecha_Postulacion DESC
    ";


    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        echo json_encode(['error' => 'Error en la consulta SQL de candidatos de vacantes: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    // Obtener lista de candidatos
    $listaDeCandidatos = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $listaDeCandidatos[] = $fila;
    }

    // Respuesta JSON con la cantidad y lista de vacantes + seguidores
    echo json_encode([
        'candidatos' => $listaDeCandidatos,
    ]);
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
