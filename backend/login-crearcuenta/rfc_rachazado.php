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

    if (!isset($data['idEmpresa'])) {
        echo json_encode(['error' => 'Faltan los parámetros.']);
        http_response_code(400); 
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);

    // Consulta para obtener RFC y RFC_Rechazado
    $consulta = "
    SELECT verificacion_usuarios.RFC_Rechazado, empresa.RFC 
    FROM verificacion_usuarios
    INNER JOIN empresa ON verificacion_usuarios.Empresa_ID = empresa.ID
    WHERE verificacion_usuarios.Empresa_ID = ?";
    
    // Preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $consulta);
    
    // Asegúrate de que el parámetro `userId` esté presente
    if (isset($data['userId'])) {
        mysqli_stmt_bind_param($stmt, "i", $data['userId']); // 'i' para entero (userId)
        mysqli_stmt_execute($stmt);
        
        $resultado = mysqli_stmt_get_result($stmt);
        
        if ($resultado) {
            // Obtener los datos de la consulta
            $row = mysqli_fetch_assoc($resultado);
            
            // Devolver los resultados en formato JSON
            echo json_encode([
                'rfc' => $row['RFC'], // RFC de la empresa
                'rfcRechazado' => $row['RFC_Rechazado'] // Estado de RFC rechazado
            ]);
        } else {
            echo json_encode(['error' => 'No se encontró el RFC o hubo un problema al ejecutar la consulta.']);
        }
    } else {
        echo json_encode(['error' => 'Faltan parámetros.']);
        http_response_code(400); // Bad Request
    }

    mysqli_stmt_close($stmt);
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
