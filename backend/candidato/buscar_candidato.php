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

    if (!isset($data['query'])) {
        echo json_encode(['error' => 'Falta Query']);
        http_response_code(400); 
        exit();
    }

    // Sanitizar el término de búsqueda
    $query = mysqli_real_escape_string($conexion, $data['query']);

    // Consultar en la tabla de candidatos
    $sql_candidatos = "
        SELECT 
            ID, Nombre, Apellido, Fotografia AS Foto 
        FROM candidato 
        WHERE Nombre LIKE '%$query%' OR Apellido LIKE '%$query%' OR Email LIKE '%$query%'
    ";

    $result_candidatos = mysqli_query($conexion, $sql_candidatos);
    $usuarios = []; // Un solo arreglo para almacenar los usuarios

    if ($result_candidatos) {
        while ($row = mysqli_fetch_assoc($result_candidatos)) {
            $row['tipo_usuario'] = 'candidato';  // Añadir tipo de usuario
            $usuarios[] = $row;
        }
    }

    // Consultar en la tabla de empresas
    $sql_empresas = "
        SELECT 
            ID, Nombre, Logo AS Foto 
        FROM empresa 
        WHERE Nombre LIKE '%$query%' OR Email LIKE '%$query%'
    ";

    $result_empresas = mysqli_query($conexion, $sql_empresas);

    if ($result_empresas) {
        while ($row = mysqli_fetch_assoc($result_empresas)) {
            $row['tipo_usuario'] = 'empresa';  // Añadir tipo de usuario
            $usuarios[] = $row;
        }
    }

    // Devolver los resultados en formato JSON como un solo arreglo
    echo json_encode($usuarios);

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
