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

    if (!isset($data['query']) || !isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Faltan datos importantes']);
        http_response_code(400); 
        exit();
    }

    // Sanitizar el término de búsqueda
    $query = mysqli_real_escape_string($conexion, $data['query']);
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']); // ID del candidato para excluir

    // Verificar que el término de búsqueda tenga al menos un carácter
    if (strlen($query) > 0) {
        $usuarios = []; // Un solo arreglo para almacenar los usuarios

        // Consultar en la tabla de candidatos, excluyendo el perfil del usuario que realiza la búsqueda
        $sql_candidatos = "
            SELECT 
                ID, Nombre, Apellido, Fotografia AS Foto 
            FROM candidato 
            WHERE (Nombre LIKE '$query%' OR Apellido LIKE '$query%')  -- Buscar el término en cualquier parte del nombre o apellido
            AND ID != '$idCandidato'  -- Excluir el propio perfil
        ";

        $result_candidatos = mysqli_query($conexion, $sql_candidatos);

        if ($result_candidatos) {
            while ($row = mysqli_fetch_assoc($result_candidatos)) {
                $row['tipo_usuario'] = 'candidato';  // Añadir tipo de usuario
                $usuarios[] = $row;
            }
        }

        // Consultar en la tabla de empresas, sin la necesidad de excluir el propio perfil ya que no se relacionan
        $sql_empresas = "
            SELECT 
                ID, Nombre, Logo AS Foto 
            FROM empresa 
            WHERE Nombre LIKE '$query%'  -- Buscar el término en cualquier parte del nombre
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
        // Si el término de búsqueda está vacío, devolver un arreglo vacío
        echo json_encode([]);
    }

} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
