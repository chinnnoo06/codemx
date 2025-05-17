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

    // Consulta candidatos corregida
    $consultaCandidatos = "
        SELECT
            verificacion_usuarios.ID,
            verificacion_usuarios.Candidato_ID,
            verificacion_usuarios.Correo_Verificado,
            verificacion_usuarios.Estado_Cuenta,
            verificacion_usuarios.Strikes,
            verificacion_usuarios.Fecha_Registro,
            candidato.Nombre,
            candidato.Apellido,
            candidato.Fotografia,
            candidato.Email
        FROM verificacion_usuarios
        INNER JOIN candidato ON verificacion_usuarios.Candidato_ID = candidato.ID
        ORDER BY verificacion_usuarios.Fecha_Registro DESC
    ";

    $resultadoCandidatos = mysqli_query($conexion, $consultaCandidatos);

    if (!$resultadoCandidatos) {
        echo json_encode(['error' => 'Error en la consulta candidatos SQL: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    $listaDeCandidatos = [];
    while ($fila = mysqli_fetch_assoc($resultadoCandidatos)) {
        $listaDeCandidatos[] = $fila;
    }

    // Consulta empresas corregida
    $consultaEmpresas = "
        SELECT
            verificacion_usuarios.ID,
            verificacion_usuarios.Empresa_ID,
            verificacion_usuarios.Correo_Verificado,
            verificacion_usuarios.Estado_Cuenta,
            verificacion_usuarios.RFC_Verificado,
            verificacion_usuarios.Strikes,
            verificacion_usuarios.Fecha_Registro,
            empresa.Nombre,
            empresa.Email,
            empresa.Logo
        FROM verificacion_usuarios
        INNER JOIN empresa ON verificacion_usuarios.Empresa_ID = empresa.ID
        ORDER BY verificacion_usuarios.Fecha_Registro DESC
    ";

    $resultadoEmpresas = mysqli_query($conexion, $consultaEmpresas);

    if (!$resultadoEmpresas) {
        echo json_encode(['error' => 'Error en la consulta empresas SQL: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    $listaDeEmpresas = [];
    while ($fila = mysqli_fetch_assoc($resultadoEmpresas)) {
        $listaDeEmpresas[] = $fila;
    }

    // Enviar respuesta con ambos arrays
    echo json_encode([
        'candidatos' => $listaDeCandidatos,
        'empresas' => $listaDeEmpresas
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
