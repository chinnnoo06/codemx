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

    $consultaSiguiendo = "
        SELECT empresa.ID, empresa.Nombre, empresa.Logo, seguidores.Fecha_Seguimiento
        FROM seguidores
        INNER JOIN empresa ON seguidores.Empresa_ID = empresa.ID
        WHERE seguidores.Candidato_ID = '$idCandidato'
        ORDER BY seguidores.Fecha_Seguimiento DESC
    ";

    $resultado = mysqli_query($conexion, $consultaSiguiendo);

    if (!$resultado) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    if (mysqli_num_rows($resultado) > 0) {
        $listaDeEmpresas = [];
        while ($fila = mysqli_fetch_assoc($resultado)) {
            $listaDeEmpresas[] = $fila;
        }

        $cantidadDeEmpresas = count($listaDeEmpresas);

        echo json_encode([
            'cantidad' => $cantidadDeEmpresas,
            'empresas' => $listaDeEmpresas
        ]);
    } else {
        echo json_encode(['cantidad' => 0, 'empresas' => [], 'error' => 'El candidato no sigue a ninguna empresa.']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
