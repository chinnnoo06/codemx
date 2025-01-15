<?php
require_once '../config/conexion.php';

try {
    $fechaactual = date('Y-m-d H:i:s');

    // Verificar si la cookie 'session_id' existe
    if (!isset($_COOKIE['session_id'])) {
        echo json_encode(['success' => false, 'error' => 'No se encontró la sesión.']);
        exit();
    }

    // Obtener el session_id desde la cookie
    $session_id = $_COOKIE['session_id'];

    // Validar la sesión en la tabla 'sesiones'
    $consultaSesion = "
        SELECT Candidato_ID 
        FROM sesiones 
        WHERE Session_id = '$session_id' AND Expira_en > '$fechaactual'
    ";
    $resultadoSesion = mysqli_query($conexion, $consultaSesion);

    if (!$resultadoSesion || mysqli_num_rows($resultadoSesion) === 0) {
        echo json_encode(['success' => false, 'error' => 'Sesión inválida o expirada.']);
        exit();
    }

    // Obtener el ID del candidato de la sesión
    $filaSesion = mysqli_fetch_assoc($resultadoSesion);
    $candidato_id = $filaSesion['Candidato_ID'];

    // Consulta para obtener los datos completos del candidato
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
        WHERE candidato.ID = $candidato_id
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
