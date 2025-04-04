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
        echo json_encode(['error' => 'Falta el ID del candidato']);
        http_response_code(400);
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    $consulta = "SELECT Calificacion, Comentario, empresa.Nombre, empresa.Logo FROM calificaciones_candidato
        INNER JOIN empresa ON calificaciones_candidato.Empresa_ID = emprsa.ID
        WHERE Candidato_ID = '$idCandidato'";

    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    if (mysqli_num_rows($resultado) > 0) {
        $listaDeCalificaciones = [];
        $suma = 0;
        $contador = 0;

        while ($fila = mysqli_fetch_assoc($resultado)) {
            $listaDeCalificaciones[] = $fila;
            $suma += floatval($fila['Calificacion']);
            $contador++;
        }

        $promedio = $contador > 0 ? round($suma / $contador, 2) : 0;

        echo json_encode([
            'cantidad' => $contador,
            'calificaciones' => $listaDeCalificaciones,
            'promedio' => $promedio
        ]);
    } else {
        echo json_encode(['cantidad' => 0, 'vacantes' => [], 'promedio' => 0, 'error' => 'No hay calificaciones disponibles.']);
    }
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
