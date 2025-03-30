<?php
require_once '../config/conexion.php';

// Configuración de CORS
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

    // Consultar modalidad de trabajo del candidato
    $consultaModalidadCandidato = "SELECT Modalidad_Trabajo FROM Candidato WHERE ID = '$idCandidato'";
    $resultadoModalidadCandidato = mysqli_query($conexion, $consultaModalidadCandidato);

    if ($resultadoModalidadCandidato && mysqli_num_rows($resultadoModalidadCandidato) > 0) {
        $candidato = mysqli_fetch_assoc($resultadoModalidadCandidato);
        $idModalidad_Trabajo = $candidato['Modalidad_Trabajo'];
    } else {
        echo json_encode(['error' => 'No se encontró la modalidad de trabajo para el candidato.']);
        http_response_code(404);
        exit();
    }

    // Consultar tecnologías dominadas por el candidato
    $consultaTecnologiasDominadas = "SELECT Tecnologia FROM Tecnologias_dominadas WHERE Candidato_ID = '$idCandidato'";
    $resultadoTecnologiasDominadas = mysqli_query($conexion, $consultaTecnologiasDominadas);

    if ($resultadoTecnologiasDominadas && mysqli_num_rows($resultadoTecnologiasDominadas) > 0) {
        $tecnologiasDominadas = [];
        while ($tec = mysqli_fetch_assoc($resultadoTecnologiasDominadas)) {
            $tecnologiasDominadas[] = $tec['Tecnologia'];
        }
    } else {
        echo json_encode(['error' => 'No se encontraron las tecnologías dominadas por el candidato.']);
        http_response_code(404);
        exit();
    }

    // Si ambas consultas fueron exitosas, retornar éxito
    echo json_encode([
        'success' => true
    ]);

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
