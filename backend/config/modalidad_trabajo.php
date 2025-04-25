<?php
require_once '../config/conexion.php';

// Configuración de CORS
$origenPermitido = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $origenPermitido");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejo del método OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Consulta la distribución de las vacantes según su modalidad de trabajo
    $consultaDistribucionVacantesModalidad = "
        SELECT modalidad_trabajo.ID AS Modalidad_ID, modalidad_trabajo.Modalidad, COUNT(*) AS cantidad_vacantes
        FROM vacante
        INNER JOIN modalidad_trabajo ON vacante.Modalidad = modalidad_trabajo.ID
        GROUP BY modalidad_trabajo.ID, modalidad_trabajo.Modalidad
        ORDER BY cantidad_vacantes DESC
    ";

    // Ejecutar la consulta en la base de datos
    $resultadoDistribucionVacantesModalidad = mysqli_query($conexion, $consultaDistribucionVacantesModalidad);

    // Comprobar si la consulta se ejecutó correctamente
    if ($resultadoDistribucionVacantesModalidad) {
        $distribucionModalidad = [];
        // Recorrer los resultados obtenidos de la consulta
        while ($fila = mysqli_fetch_assoc($resultadoDistribucionVacantesModalidad)) {
            // Almacenar la distribución de las vacantes según la modalidad
            $distribucionModalidad[] = [
                'id_modalidad' => $fila['Modalidad_ID'],
                'nombre_modalidad' => $fila['Modalidad'],
                'cantidad_vacantes' => $fila['cantidad_vacantes']
            ];
        }

        // Retornar la respuesta en formato JSON con la distribución de vacantes por modalidad
        echo json_encode([
            'exito' => true,
            'distribucion_vacantes' => $distribucionModalidad
        ]);
    } else {
        // Si ocurre un error en la consulta, se registra el error y se retorna una respuesta de error
        error_log("Error al consultar la distribución de las vacantes por modalidad: " . mysqli_error($conexion));
        echo json_encode(['error' => 'Error al consultar la distribución de las vacantes por modalidad.']);
        http_response_code(500);
    }

} else {
    // Si el método HTTP no es POST, se devuelve un error 405 (Método no permitido)
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
