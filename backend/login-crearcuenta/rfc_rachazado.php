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
    WHERE verificacion_usuarios.Empresa_ID = '$idEmpresa'";

    // Ejecutar la consulta
    $resultado = mysqli_query($conexion, $consulta);

    // Verificar si la consulta se ejecutó correctamente
    if ($resultado) {
        // Obtener el resultado en un array asociativo
        $fila = mysqli_fetch_assoc($resultado);

        // Verificar si hay datos
        if ($fila) {
            echo json_encode([
                'rfcRechazado' => $fila['RFC_Rechazado'],
                'rfc' => $fila['RFC']
            ]);
        } else {
            echo json_encode(['error' => 'No se encontraron datos para la empresa especificada.']);
        }
    } else {
        // En caso de error en la consulta
        echo json_encode(['error' => 'Error al ejecutar la consulta.']);
    }

} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
