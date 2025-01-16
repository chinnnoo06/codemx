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

// Verificar el método de la solicitud
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que el idCandidato esté presente
    if (!isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID del candidato.']);
        http_response_code(400); // Bad Request
        exit();
    }

    // Escapar y sanitizar el ID del candidato
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    // Consulta SQL para obtener las empresas que sigue el candidato
    $consultaSiguiendo = "
        SELECT empresa.ID, empresa.Nombre, empresa.Logo
        FROM seguidores
        INNER JOIN empresa ON seguidores.Empresa_ID = empresa.ID
        WHERE seguidores.Candidato_ID = '$idCandidato'
    ";

    // Ejecutar la consulta
    $resultado = mysqli_query($conexion, $consultaSiguiendo);

    // Verificar si hay errores en la consulta
    if (!$resultado) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500); // Internal Server Error
        exit();
    }

    // Procesar los resultados
    if (mysqli_num_rows($resultado) > 0) {
        $listaDeEmpresas = [];
        while ($fila = mysqli_fetch_assoc($resultado)) {
            $listaDeEmpresas[] = $fila;
        }

        $cantidadDeEmpresas = count($listaDeEmpresas);

        // Respuesta con la cantidad de empresas y sus detalles
        echo json_encode([
            'cantidad' => $cantidadDeEmpresas,
            'empresas' => $listaDeEmpresas
        ]);
    } else {
        // Respuesta si no sigue a ninguna empresa
        echo json_encode(['cantidad' => 0, 'empresas' => [], 'error' => 'El candidato no sigue a ninguna empresa.']);
    }
} else {
    // Método no permitido
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
