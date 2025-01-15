<?php
require_once '../config/conexion.php';

// Configuración segura de cookies de sesión
session_set_cookie_params([
    'lifetime' => 3600,
    'path' => '/',
    'domain' => '.codemx.net',
    'secure' => isset($_SERVER['HTTPS']), // Solo sobre HTTPS
    'httponly' => true,
    'samesite' => 'None',
]);

session_start();

// Habilitar CORS
header('Access-Control-Allow-Origin: https://www.codemx.net');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Verificar método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit();
}

// Verificar parámetros de entrada
if (empty($_POST['Correo_Electronico']) || empty($_POST['Password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Correo y contraseña son obligatorios']);
    exit();
}

$email = mysqli_real_escape_string($conexion, $_POST['Correo_Electronico']);
$password = $_POST['Password'];

try {
    // Consulta para verificar credenciales
    $consulta = "SELECT ID, Password FROM candidato WHERE Email = ?";
    $stmt = $conexion->prepare($consulta);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Usuario o contraseña incorrectos']);
        exit();
    }

    $usuario = $resultado->fetch_assoc();

    if (!password_verify($password, $usuario['Password'])) {
        echo json_encode(['success' => false, 'error' => 'Usuario o contraseña incorrectos']);
        exit();
    }

    // Establecer sesión
    $_SESSION['usuario'] = $email;

    echo json_encode(['success' => true, 'message' => 'Inicio de sesión exitoso']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
