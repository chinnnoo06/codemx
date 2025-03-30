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

    // Consulta para obtener las tecnologías dominadas junto con su nombre y categoría
    $consultaTecnologiasDominadas = "
        SELECT 
            tecnologias_dominadas.Candidato_ID, 
            tecnologias.ID AS id_tecnologia, 
            tecnologias.Tecnologia AS nombre_tecnologia, 
            tecnologias.Categoria AS categoria_tecnologia
        FROM 
            tecnologias_dominadas
        INNER JOIN 
            tecnologias 
        ON 
            tecnologias_dominadas.Tecnologia = tecnologias.ID
        WHERE 
            tecnologias_dominadas.Candidato_ID = '$idCandidato'
    ";

    $resultadoTecnologiasDominadas = mysqli_query($conexion, $consultaTecnologiasDominadas);

    if (!$resultadoTecnologiasDominadas) {
        echo json_encode(['error' => 'Error en la consulta SQL de tecnologías dominadas: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    $listaDeTecnologiasDominadas = [];

    while ($fila = mysqli_fetch_assoc($resultadoTecnologiasDominadas)) {
        $listaDeTecnologiasDominadas[] = [
            'id_tecnologia' => $fila['id_tecnologia'],
            'nombre_tecnologia' => $fila['nombre_tecnologia'],
            'categoria_tecnologia' => $fila['categoria_tecnologia']
        ];
    }

    echo json_encode([
        'success' => true,
        'tecnologias_dominadas' => $listaDeTecnologiasDominadas
    ]);
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
