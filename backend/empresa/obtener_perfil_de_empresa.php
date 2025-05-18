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
        echo json_encode(['error' => 'Falta el ID del candidato.']);
        http_response_code(400); 
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);

    $consulta = "
        SELECT 
            empresa.ID,
            empresa.Nombre AS Empresa_Nombre,
            empresa.Descripcion,
            sector.Sector AS Sector_Nombre,
            tamanio.Tamanio AS Tamanio_Nombre,
            empresa.Telefono,
            empresa.Email,
            empresa.Logo,
            empresa.Fecha_Creacion,
            empresa.RFC,
            verificacion_usuarios.Correo_Verificado,
            verificacion_usuarios.RFC_Verificado,
            verificacion_usuarios.Estado_Cuenta,
            verificacion_usuarios.Strikes,
            verificacion_usuarios.Fecha_Registro
        FROM empresa
        INNER JOIN sector ON empresa.Sector = sector.ID
        INNER JOIN tamanio ON empresa.Tamanio = tamanio.ID
        WHERE empresa.ID = $idEmpresa
        LIMIT 1
    ";

    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . mysqli_error($conexion)]);
        exit();
    }

    $fila = mysqli_fetch_assoc($resultado);

    if ($fila) {
        echo json_encode([
            'success' => true,
            'id' => $fila['ID'],
            'nombre' => $fila['Empresa_Nombre'],
            'descripcion' => $fila['Descripcion'],
            'sector' => $fila['Sector_Nombre'],
            'tamanio' => $fila['Tamanio_Nombre'],
            'telefono' => $fila['Telefono'],
            'email' => $fila['Email'],
            'logo' => $fila['Logo'],
            'fecha_creacion' => $fila['Fecha_Creacion'],
            'rfc' => $fila['RFC'],
            'Correo_Verificado' => $fila['Correo_Verificado'],
            'RFC_Verificado' => $fila['RFC_Verificado'],
            'Estado_Cuenta' => $fila['Estado_Cuenta'],
            'Strikes' => $fila['Strikes'],
            'Fecha_Registro' => $fila['Fecha_Registro'],
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró al candidato.']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
