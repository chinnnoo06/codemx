<?php
require_once '../config/conexion.php';

try {
    // Consulta para obtener los datos completos del candidato y los nombres de las tablas relacionadas
    $consulta = "
        SELECT 
            candidato.ID,
            candidato.Nombre,
            candidato.Apellido,
            candidato.Fecha_Nacimiento,
            candidato.Email,
            candidato.Telefono,
            candidato.Direccion,
            estado.Nombre,
            sexo.Sexo,
            candidato.Fotografia,
            universidad.Nombre,
            candidato.Tiempo_Restante,
            modalidad_trabajo.Modalidad,
            candidato.CV
        FROM candidato
        INNER JOIN estado ON candidato.Estado = estado.ID
        INNER JOIN sexo ON candidato.Sexo = sexo.ID
        INNER JOIN universidad ON candidato.Universidad = universidad.ID
        INNER JOIN modalidad_trabajo ON candidato.Modalidad_Trabajo = modalidad_trabajo.ID
        WHERE candidato.ID = 1
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
            'nombre' => $fila['Nombre'],
            'apellido' => $fila['Apellido'],
            'fecha_nacimiento' => $fila['Fecha_Nacimiento'],
            'email' => $fila['Email'],
            'telefono' => $fila['Telefono'],
            'direccion' => $fila['Direccion'],
            'estado' => $fila['Nombre'],
            'sexo' => $fila['Nombre'],
            'fotografia' => $fila['Fotografia'],
            'universidad' => $fila['Nombre'],
            'tiempo_restante' => $fila['Tiempo_Restante'],
            'modalidad_trabajo' => $fila['Nombre'],
            'cv' => $fila['CV']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró al candidato.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
