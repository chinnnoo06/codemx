<?php
require_once '../config/conexion.php';
/*
session_start();

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado.']);
    exit();
}

$email = $_SESSION['usuario'];

*/

try {
    // Consultar el ID y la foto del candidato asociado al email
   /* $consulta = "
        SELECT 
            ID,
            Fotografia 
        FROM candidato 
        WHERE Email = '$email'
        LIMIT 1
    ";*/
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
        LEFT JOIN estado ON candidato.Estado = estado.ID
        LEFT JOIN sexo ON candidato.Sexo = sexo.ID
        LEFT JOIN universidad ON candidato.Universidad = universidad.ID
        LEFT JOIN modalidad_trabajo ON candidato.Modalidad_Trabajo = modalidad_trabajo.ID
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
            'Apellido' => $fila['Apellido'],
            'fecha_nacimiento' => $fila['Fecha_Nacimiento'],
            'email' => $fila['Email'],
            'telefono' => $fila['Telefono'],
            'direccion' => $fila['Direccion'],
            'estado' => $fila['Estado'],
            'sexo' => $fila['Sexo'],
            'fotografia' => $fila['Forografia'],
            'universidad' => $fila['Universidad'],
            'tiempo_restante' => $fila['Tiempo_Restante'],
            'modalidad_trabajo' => $fila['Modalidad_Trabajo'],
            'cv' => $fila['CV']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró al candidato.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
