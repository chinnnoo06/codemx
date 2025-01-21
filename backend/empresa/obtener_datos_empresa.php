<?php
require_once '../config/conexion.php';

header("Content-Type: application/json");

try {
    // Obtén el cuerpo de la solicitud
    $fechaActual = date('Y-m-d H:i:s');
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['session_id'])) {
        echo json_encode(['success' => false, 'error' => 'Session ID no proporcionado.']);
        exit();
    }

    $session_id = $input['session_id'];

    // Busca el ID del candidato en la tabla sesiones usando el session_id
    $consultaSesion = "
        SELECT Empresa_ID
        FROM sesiones
        WHERE Session_ID = '$session_id' AND Expira_en > '$fechaActual'
        LIMIT 1
    ";

    $resultadoSesion = mysqli_query($conexion, $consultaSesion);

    if (!$resultadoSesion) {
        echo json_encode(['success' => false, 'error' => 'Error al buscar la sesión: ' . mysqli_error($conexion)]);
        exit();
    }

    $filaSesion = mysqli_fetch_assoc($resultadoSesion);

    if (!$filaSesion || !$filaSesion['Empresa_ID']) {
        echo json_encode(['success' => false, 'error' => 'Sesión inválida o expirada.']);
        exit();
    }

    $empresaId = $filaSesion['Empresa_ID'];

    // Consulta para obtener los datos del candidato
    $consulta = "
        SELECT 
            empresa.ID,
            empresa.Nombre AS Empresa_Nombre,
            empresa.Descripcion,
            sector.Sector AS Sector_Nombre,
            tamanio.Tamanio AS Tamanio_Nombre
            empresa.Telefono,
            empresa.Email,
            empresa.Logo,
            empresa.Fecha_Creacion,
            empresa.RFC,
        FROM empresa
        INNER JOIN sector ON empresa.Sector = Sector.ID
        INNER JOIN tamanio ON empresa.Tamanio = Tamanaio.ID
        WHERE empresa.ID = $empresaId
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
            'nombre' => $fila[' Empresa_Nombre'],
            'descripcion' => $fila['Descripcion'],
            'sector' => $fila['Sector_Nombre'],
            'tamanio' => $fila['Tamanio_Nombre'],
            'telefono' => $fila['Telefono'],
            'email' => $fila['Email'],
            'logo' => $fila['Logo'],
            'fecha_creacion' => $fila['Fecha_Creacion'],
            'rfc' => $fila['rfc'],
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró a la empresa.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
