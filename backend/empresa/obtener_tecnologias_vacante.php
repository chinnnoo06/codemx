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

    // Consulta para obtener las tecnologías dominadas junto con su nombre y categoría
    $consultaTecnologiasRequeridas = "
        SELECT 
        tecnologias_vacante.Vacante_ID,
        tecnologias.ID AS id_tecnologia,
        tecnologias.Tecnologia AS nombre_tecnologia,
        tecnologias.Categoria AS categoria_tecnologia
        FROM tecnologias_vacante
        INNER JOIN tecnologias ON tecnologias_vacante.Tecnologia_ID = tecnologias.ID
        WHERE tecnologias_vacante.Vacante_ID = '$idVacante'
    ";

    $resultadoTecnologiasRqueridas = mysqli_query($conexion, $consultaTecnologiasRequeridas);

    if (!$resultadoTecnologiasRqueridas) {
        echo json_encode(['error' => 'Error en la consulta SQL de tecnologías requeridas: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    $listaDeTecnologiasRequeridas = [];

    while ($fila = mysqli_fetch_assoc($resultadoTecnologiasRqueridas)) {
        $listaDeTecnologiasRequeridas[] = [
            'id_tecnologia' => $fila['id_tecnologia'],
            'nombre_tecnologia' => $fila['nombre_tecnologia'],
            'categoria_tecnologia' => $fila['categoria_tecnologia']
        ];
    }

    echo json_encode([
        'success' => true,
        'tecnologias_requeridas' => $listaDeTecnologiasRequeridas
    ]);
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
