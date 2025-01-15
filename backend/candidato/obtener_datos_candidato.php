<?php
require_once '../config/conexion.php';

// Configuración segura de la cookie de sesión
session_set_cookie_params([
    'lifetime' => 3600,       // Tiempo de vida de la cookie (1 hora)
    'path' => '/',            // Disponible para todo el sitio
    'domain' => '.codemx.net', // Dominio principal
    'secure' => true,         // Solo sobre HTTPS
    'httponly' => true,       // No accesible desde JavaScript
    'samesite' => 'None',     // Compatible con solicitudes cross-origin
]);

session_start(); // Inicia la sesión

// Habilitar CORS
header('Access-Control-Allow-Origin: https://www.codemx.net');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Verificar si la sesión está activa
if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'error' => 'Sesión no iniciada.']);
    exit();
}

$emailUsuario = $_SESSION['usuario'];

try {
    // Consulta optimizada para obtener los datos del candidato
    $consulta = "
    SELECT 
        candidato.ID,
        candidato.Nombre AS Candidato_Nombre,
        candidato.Apellido,
        candidato.Fecha_Nacimiento,
        candidato.Email,
        candidato.Telefono,
        candidato.Direccion,
        estado.Nombre AS Estado_Nombre,
        sexo.Sexo AS Sexo_Nombre,
        candidato.Fotografia,
        universidad.Nombre AS Universidad_Nombre,
        candidato.Tiempo_Restante,
        modalidad_trabajo.Modalidad AS Modalidad_Trabajo_Nombre,
        candidato.CV
    FROM candidato
    INNER JOIN estado ON candidato.Estado = estado.ID
    INNER JOIN sexo ON candidato.Sexo = sexo.ID
    INNER JOIN universidad ON candidato.Universidad = universidad.ID
    INNER JOIN modalidad_trabajo ON candidato.Modalidad_Trabajo = modalidad_trabajo.ID
    WHERE candidato.Email = ?
    LIMIT 1";

    // Preparar y ejecutar la consulta para evitar inyección SQL
    $stmt = $conexion->prepare($consulta);
    $stmt->bind_param('s', $emailUsuario);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if (!$resultado) {
        echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . $conexion->error]);
        exit();
    }

    $fila = $resultado->fetch_assoc();

    if ($fila) {
        echo json_encode([
            'success' => true,
            'id' => $fila['ID'],
            'nombre' => $fila['Candidato_Nombre'],
            'apellido' => $fila['Apellido'],
            'fecha_nacimiento' => $fila['Fecha_Nacimiento'],
            'email' => $fila['Email'],
            'telefono' => $fila['Telefono'],
            'direccion' => $fila['Direccion'],
            'estado' => $fila['Estado_Nombre'],
            'sexo' => $fila['Sexo_Nombre'],
            'fotografia' => $fila['Fotografia'],
            'universidad' => $fila['Universidad_Nombre'],
            'tiempo_restante' => $fila['Tiempo_Restante'],
            'modalidad_trabajo' => $fila['Modalidad_Trabajo_Nombre'],
            'cv' => $fila['CV']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró al candidato.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
