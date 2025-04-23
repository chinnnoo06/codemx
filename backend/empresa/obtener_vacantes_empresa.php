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

    if (!isset($data['idEmpresa'])) {
        echo json_encode(['error' => 'Falta el ID de la empresa.']);
        http_response_code(400); 
        exit();
    }

    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $fecha = date('Y-m-d H:i:s'); // Fecha actual

    $consulta = "
        SELECT 
            vacante.ID,
            vacante.Titulo,
            vacante.Descripcion,
            modalidad_trabajo.Modalidad AS Modalidad_Vacante,
            estado.Nombre AS Estado_Vacante,
            vacante.Ubicacion,
            vacante.Fecha_Limite,
            vacante.Estatus,
            vacante.Fecha_Creacion,
            COALESCE(COUNT(postulaciones.ID), 0) AS Cantidad_Postulados,
            empresa.ID AS Empresa_ID,
            empresa.Nombre AS Empresa_Nombre,
            empresa.Logo AS Empresa_Logo
        FROM vacante
        INNER JOIN modalidad_trabajo ON vacante.Modalidad = modalidad_trabajo.ID
        INNER JOIN estado ON vacante.Estado = estado.ID
        LEFT JOIN postulaciones ON vacante.ID = postulaciones.Vacante_ID
        INNER JOIN empresa ON vacante.Empresa_ID = empresa.ID
        WHERE vacante.Empresa_ID = '$idEmpresa'
        GROUP BY vacante.ID
        ORDER BY vacante.Fecha_Creacion DESC
    ";

    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    if (mysqli_num_rows($resultado) > 0) {
        $listaDeVacantes = [];
        while ($fila = mysqli_fetch_assoc($resultado)) {
            // Comprobar si la fecha límite es menor que la fecha actual
            if ($fila['Fecha_Limite'] < $fecha) {
                // Actualizar el estatus de la vacante a "inactiva"
                $updateQuery = "UPDATE vacante SET Estatus = 'inactiva' WHERE ID = '{$fila['ID']}'";
                mysqli_query($conexion, $updateQuery); // Ejecutar la actualización

                // Eliminar todas las postulaciones relacionadas a esa vacante
                $deletePostulaciones = "DELETE FROM postulaciones WHERE Vacante_ID = '{$fila['ID']}'";
                mysqli_query($conexion, $deletePostulaciones); // Ejecutar el borrado

                $fila['Estatus'] = 'inactiva';  // Actualizar en la respuesta también
            }

            $listaDeVacantes[] = $fila;
        }

        echo json_encode([
            'cantidad' => count($listaDeVacantes),
            'vacantes' => $listaDeVacantes
        ]);
    } else {
        echo json_encode(['cantidad' => 0, 'vacantes' => [], 'error' => 'La empresa no tiene vacantes disponibles.']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
