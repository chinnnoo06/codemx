<?php
require_once '../config/conexion.php';
require_once '../env_loader.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
require '../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;

// Configuración segura de cookies de sesión
session_set_cookie_params([
    'lifetime' => 3600,        // Tiempo de vida de la cookie (1 hora)
    'path' => '/',             // Disponible para todo el sitio
    'domain' => '.codemx.net', // Dominio principal
    'secure' => true,          // Solo sobre HTTPS
    'httponly' => true,        // No accesible desde JavaScript
    'samesite' => 'None'       // Compatible con solicitudes cross-origin
]);

session_start(); // Inicia la sesión

// Habilitar CORS
header('Access-Control-Allow-Origin: https://www.codemx.net'); // Cambia al dominio de tu frontend
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Verificar el método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido.']);
    exit();
}

// Validar parámetros enviados
if (empty($_POST['Correo_Electronico']) || empty($_POST['Password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Correo electrónico y contraseña son obligatorios.']);
    exit();
}

$email = mysqli_real_escape_string($conexion, $_POST['Correo_Electronico']);
$password = $_POST['Password'];

try {
    // Consulta optimizada para verificar al usuario
    $consulta = "
    SELECT 
        'candidato' AS tipo, 
        candidato.ID, 
        candidato.Password, 
        verificacion_usuarios.Correo_Verificado, 
        verificacion_usuarios.Estado_Cuenta, 
        NULL AS RFC_Verificado
    FROM candidato
    LEFT JOIN verificacion_usuarios ON verificacion_usuarios.Candidato_ID = candidato.ID
    WHERE candidato.Email = '$email'
    UNION
    SELECT 
        'empresa' AS tipo, 
        empresa.ID, 
        empresa.Password, 
        verificacion_usuarios.Correo_Verificado, 
        verificacion_usuarios.Estado_Cuenta, 
        verificacion_usuarios.RFC_Verificado
    FROM empresa
    LEFT JOIN verificacion_usuarios ON verificacion_usuarios.Empresa_ID = empresa.ID
    WHERE empresa.Email = '$email'
    LIMIT 1";

    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        throw new Exception('Error en la consulta SQL: ' . mysqli_error($conexion));
    }

    $fila = mysqli_fetch_assoc($resultado);

    if ($fila && password_verify($password, $fila['Password'])) {
        // Manejo según tipo de usuario y estado de cuenta
        if ($fila['Correo_Verificado'] == 1 && $fila['Estado_Cuenta'] == 1) {
            $_SESSION['usuario'] = $email;
            echo json_encode(['success' => true, 'tipo' => $fila['tipo']]);
            exit();
        } elseif ($fila['Correo_Verificado'] == 0) {
            echo json_encode(['success' => false, 'redirect' => '/falta-verificar-correo', 'message' => 'Debes verificar tu correo electrónico.']);
            exit();
        } else {
            echo json_encode(['success' => false, 'message' => 'Tu cuenta está deshabilitada.']);
            exit();
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Correo o contraseña incorrectos.']);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
    exit();
}
?>
