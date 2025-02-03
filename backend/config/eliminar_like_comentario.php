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
    http_response_code(204);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idEmpresa']) && !isset($data['idCandidato']) || !isset($data['idComentario'])) {
        echo json_encode(['error' => 'Falta el ID de la empresa o candidato, o ID del comentario.']);
        http_response_code(400); 
        exit();
    }

    // Determinar qué tipo de usuario está realizando la petición
    $idEmpresa = isset($data['idEmpresa']) && !empty($data['idEmpresa']) 
    ? "'" . mysqli_real_escape_string($conexion, $data['idEmpresa']) . "'" 
    : null;

    $idCandidato = isset($data['idCandidato']) && !empty($data['idCandidato']) 
        ? "'" . mysqli_real_escape_string($conexion, $data['idCandidato']) . "'" 
        : null;

    $idComentario = mysqli_real_escape_string($conexion, $data['idComentario']);

    if($idEmpresa != null){
        $consulta = "DELETE FROM reacciones_comentarios WHERE Comentario_ID = '$idComentario' AND Empresa_ID = '$idEmpresa'";
    } elseif ($idCandidato != null){
        $consulta = "DELETE FROM reacciones_comentarios WHERE Comentario_ID = '$idComentario' AND Candidato_ID = '$idCandidato'";
    }

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Like eliminado.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al eliminar: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
