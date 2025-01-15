<?php
require_once '../config/conexion.php';

// Configurar las cookies de sesión
session_set_cookie_params([
    'lifetime' => 3600,       // Tiempo de vida en segundos (1 hora)
    'path' => '/',            // Disponible para todo el sitio
    'domain' => '.codemx.net', // Dominio principal
    'secure' => true,         // Solo sobre HTTPS
    'httponly' => true,       // No accesible por JavaScript
    'samesite' => 'Lax',      // Compatible con navegadores modernos
]);

session_start(); // Inicia la sesión

// Verificar si la sesión está activa
if (!isset($_SESSION['usuario'])) {
    http_response_code(401); // Código de no autorizado
    echo json_encode(['error' => 'Sesión no iniciada.']);
    exit();
}

// Verificar el método HTTP
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $idCandidato = mysqli_real_escape_string($conexion, $_POST['idCandidato']);

    // Consulta para verificar si el candidato sigue a alguna empresa
    $consultaSiguiendo = "
        SELECT empresas.Empresa_ID, empresas.Nombre, empresas.Email
        FROM seguidores
        INNER JOIN empresas ON seguidores.Empresa_ID = empresas.Empresa_ID
        WHERE seguidores.Candidato_ID = '$idCandidato'
    ";

    $resultado = mysqli_query($conexion, $consultaSiguiendo);

    if ($resultado) {
        if (mysqli_num_rows($resultado) > 0) {
            $listaDeEmpresas = [];
            while ($fila = mysqli_fetch_assoc($resultado)) {
                $listaDeEmpresas[] = $fila;
            }

            $cantidadDeEmpresas = count($listaDeEmpresas);

            // Respuesta con la cantidad de empresas y sus detalles
            echo json_encode([
                'success' => true,
                'cantidad' => $cantidadDeEmpresas,
                'empresas' => $listaDeEmpresas
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'El candidato no sigue a ninguna empresa.'
            ]);
        }
    } else {
        http_response_code(500); // Código de error interno del servidor
        echo json_encode([
            'success' => false,
            'error' => 'Error en la consulta: ' . mysqli_error($conexion)
        ]);
    }
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
