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

    $consulta = "
        SELECT verificacion_usuarios.ID, verificacion_usuarios.Empresa_ID, verificacion_usuarios.Correo_Verificado, verificacion_usuarios.RFC_Verificado, verificacion_usuarios.Fecha_Registro, 
        empresa.Nombre, empresa.Descripcion, empresa.Telefono, empresa.Email, empresa.Logo, empresa.RFC, sector.Sector, tamanio.Tamanio
        FROM verificacion_usuarios
        INNER JOIN empresa ON verificacion_usuarios.Empresa_ID = empresa.ID
        INNER JOIN sector ON empresa.Sector = sector.ID
        INNER JOIN tamanio ON empresa.Tamanio = tamanio.ID
        WHERE verificacion_usuarios.RFC_Verificado = 0
        ORDER BY verificacion_usuarios.Fecha_Registro DESC
    ";

    $resultado = mysqli_query($conexion, $consultaSiguiendo);

    if (!$resultado) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    if (mysqli_num_rows($resultado) > 0) {
        $listaDeSolicitudes= [];
        while ($fila = mysqli_fetch_assoc($resultado)) {
            $listaDeSolicitudes[] = $fila;
        }

        echo json_encode([
            'solicitudes' => $listaDeSolicitudes
        ]);
    } else {
        echo json_encode(['solicitudes' => [], 'error' => 'No hay solicitudes']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
