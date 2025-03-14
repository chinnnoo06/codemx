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
        SELECT Candidato_ID
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

    if (!$filaSesion || !$filaSesion['Candidato_ID']) {
        echo json_encode(['success' => false, 'error' => 'Sesión inválida o expirada.']);
        exit();
    }

    $candidatoId = $filaSesion['Candidato_ID'];

    // Consulta para obtener los datos del candidato
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
        WHERE candidato.ID = $candidatoId
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
            'cv' => $fila['CV']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró al candidato.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
