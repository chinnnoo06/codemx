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

    $consultaPostuladas = "
        SELECT 
            postulaciones.Vacante_ID,
            postulaciones.Estado_Candidato,
            vacante.Titulo AS Titulo,
            vacante.Descripcion AS Descripcion,
            modalidad_trabajo.Modalidad AS Modalidad_Vacante,
            estado.Nombre AS Estado_Vacante,
            vacante.Ubicacion AS Ubicacion,
            vacante.Fecha_Limite AS Fecha_Limite,
            vacante.Estatus AS Estatus,
            vacante.Fecha_Creacion AS Fecha_Creacion,
            COALESCE(COUNT(postulaciones.ID), 0) AS Cantidad_Postulados
        FROM postulaciones
        INNER JOIN vacante ON postulaciones.Vacante_ID = vacante.ID
        INNER JOIN modalidad_trabajo ON vacante.Modalidad = modalidad_trabajo.ID
        INNER JOIN estado ON vacante.Estado = estado.ID
        WHERE postulaciones.Candidato_ID = '$idCandidato'
        GROUP BY vacante.ID
    ";

    $resultadoPostuladas = mysqli_query($conexion, $consultaPostuladas);

    if (!$resultadoPostuladas) {
        echo json_encode(['error' => 'Error en la consulta SQL de Postuladas: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    if (mysqli_num_rows($resultadoPostuladas) > 0) {
        $listaDeVacantes = [];
        while ($fila = mysqli_fetch_assoc($resultadoPostuladas)) {
            
            $listaDeVacantes[] = $fila;
        }

        echo json_encode([
            'cantidad' => count($listaDeVacantes),
            'vacantesPostuladas' => $listaDeVacantes
        ]);
    } else {
        echo json_encode(['cantidad' => 0, 'vacantesPostuladas' => [], 'error' => 'La empresa no tiene vacantes disponibles.']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
