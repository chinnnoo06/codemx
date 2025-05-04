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

    if (!isset($data['tecnologiaIds'])) {
        echo json_encode(['error' => 'Faltan parámetros en la solicitud.']);
        http_response_code(400);
        exit();
    }

    // Sanear los IDs de las tecnologías recibidos
    $tecnologiaIds = $data['tecnologiaIds'];

    // Crear el filtro para los IDs de tecnologías
    $tecnologiaIdsStr = implode(',', array_map(function($id) use ($conexion) {
        return mysqli_real_escape_string($conexion, $id);
    }, $tecnologiaIds));

    // Consultar vacantes activas que coincidan con las tecnologías seleccionadas
    $consultaVacantes = "
        SELECT 
            vacante.ID AS ID,
            vacante.Titulo AS Titulo,
            vacante.Descripcion AS Descripcion,
            modalidad_trabajo.Modalidad AS Modalidad_Vacante,
            estado.Nombre AS Estado_Vacante,
            vacante.Ubicacion AS Ubicacion,
            vacante.Fecha_Limite AS Fecha_Limite,
            vacante.Estatus AS Estatus,
            vacante.Fecha_Creacion AS Fecha_Creacion,
            vacante.Estado AS Estado_Vacante_ID,
            (SELECT COUNT(*) FROM postulaciones WHERE postulaciones.Vacante_ID = vacante.ID) AS Cantidad_Postulados, 
            empresa.ID AS Empresa_ID,
            empresa.Nombre AS Empresa_Nombre,
            empresa.Logo AS Empresa_Logo
        FROM vacante
        INNER JOIN modalidad_trabajo ON vacante.Modalidad = modalidad_trabajo.ID
        INNER JOIN estado ON vacante.Estado = estado.ID
        INNER JOIN empresa ON vacante.Empresa_ID = empresa.ID
        LEFT JOIN postulaciones ON vacante.ID = postulaciones.Vacante_ID
        INNER JOIN tecnologias_vacante ON vacante.ID = tecnologias_vacante.Vacante_ID
        WHERE vacante.Estatus = 'activa'  -- Filtrar solo vacantes activas
        AND tecnologias_vacante.Tecnologia_ID IN ($tecnologiaIdsStr) -- Filtrar por tecnologías seleccionadas
        GROUP BY vacante.ID
    ";

    $resultadoVacantes = mysqli_query($conexion, $consultaVacantes);

    if (!$resultadoVacantes) {
        error_log("Error al consultar vacantes: " . mysqli_error($conexion));
        echo json_encode(['error' => 'Error al consultar las vacantes.']);
        http_response_code(500);
        exit();
    }

    $vacantes = [];
    while ($vacante = mysqli_fetch_assoc($resultadoVacantes)) {
        // Consultar tecnologías requeridas por la vacante
        $consultaTecnologiasVacante = "SELECT Tecnologia_ID FROM tecnologias_vacante WHERE Vacante_ID = '".$vacante['ID']."'";
        $resultadoTecnologiasVacante = mysqli_query($conexion, $consultaTecnologiasVacante);

        if (!$resultadoTecnologiasVacante) {
            error_log("Error al consultar tecnologías de la vacante: " . mysqli_error($conexion));
            continue; // Pasar a la siguiente vacante si hay un error con las tecnologías
        }

        $tecnologiasRequeridas = [];
        while ($tecVacante = mysqli_fetch_assoc($resultadoTecnologiasVacante)) {
            $tecnologiasRequeridas[] = $tecVacante['Tecnologia_ID']; // Esto debe ser el ID de la tecnología
        }

        // Contar coincidencias entre las tecnologías seleccionadas y las tecnologías requeridas por la vacante
        $coincidencias = 0;
        foreach ($tecnologiaIds as $tecSeleccionada) {
            if (in_array($tecSeleccionada, $tecnologiasRequeridas)) {
                $coincidencias++;
            }
        }

        // Calcular el porcentaje de compatibilidad
        $porcentajeCompatibilidad = 0;
        if (count($tecnologiasRequeridas) > 0) {
            $porcentajeCompatibilidad = round(($coincidencias / count($tecnologiasRequeridas)) * 100, 2); // Porcentaje con dos decimales
        }

        // Si hay coincidencias, agregar la vacante a las recomendaciones con la compatibilidad
        if ($coincidencias > 0) {
            $vacantes[] = array_merge($vacante, [
                'coincidencias' => $coincidencias,
                'compatibilidad' => $porcentajeCompatibilidad
            ]);
        }
    }

    // Ordenar vacantes por compatibilidad (de mayor a menor)
    usort($vacantes, function($a, $b) {
        return $b['compatibilidad'] - $a['compatibilidad']; // Ordenar solo por compatibilidad
    });

    // Retornar las vacantes recomendadas ordenadas por compatibilidad
    echo json_encode([
        'success' => true,
        'vacantes' => $vacantes
    ]);
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
