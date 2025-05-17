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
            candidato.CV,
            verificacion_usuarios.Correo_Verificado,
            verificacion_usuarios.Estado_Cuenta,
            verificacion_usuarios.Strikes,
            verificacion_usuarios.Fecha_Registro
        FROM candidato
        INNER JOIN estado ON candidato.Estado = estado.ID
        INNER JOIN sexo ON candidato.Sexo = sexo.ID
        INNER JOIN universidad ON candidato.Universidad = universidad.ID
        INNER JOIN modalidad_trabajo ON candidato.Modalidad_Trabajo = modalidad_trabajo.ID
        INNER JOIN verificacion_usuarios ON candidato.ID = verificacion_usuarios.Candidato_ID
        WHERE candidato.ID = $idCandidato
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
            'cv' => $fila['CV'],
            'Correo_Verificado' => $fila['Correo_Verificado'],
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
