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

    if (!isset($data['idCandidato']) || !isset($data['idVacante'])  ) {
        echo json_encode(['error' => 'Falta el ID del candidato o de la vacante']);
        http_response_code(400);
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);

    $consulta = "SELECT Calificacion, Comentario FROM calificaciones_candidato
        WHERE Candidato_ID = '$idCandidato' AND Vacante_ID = '$idVacante'";

    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    // Comprobar si la consulta devolvió un resultado
    if ($fila = mysqli_fetch_assoc($resultado)) {
        echo json_encode([
            'success' => true,
            'calificacion' => $fila['Calificacion'],
            'comentarioCalificacion' => $fila['Comentario']
        ]);
    } else {
        // Si no se encuentra el estado, se devuelve un estado null sin generar un error
        echo json_encode([
            'success' => true,
            'calificacion' => null,
            'comentarioCalificacion' => null
        ]);
    }
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
