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

     // Consultar modalidad de trabajo del candidato
     $consultaModalidadCandidato = "SELECT Modalidad_Trabajo FROM candidato WHERE ID = '$idCandidato'";
     $resultadoModalidadCandidato = mysqli_query($conexion, $consultaModalidadCandidato);
 
     if ($resultadoModalidadCandidato && mysqli_num_rows($resultadoModalidadCandidato) > 0) {
         $candidato = mysqli_fetch_assoc($resultadoModalidadCandidato);
         $idModalidad_Trabajo = $candidato['Modalidad_Trabajo'];
     } else {
         $response['error'] = 'No se encontró la modalidad de trabajo para el candidato.';
         echo json_encode($response);
         exit();
     }

     // Consultar tecnologías dominadas por el candidato
     $consultaTecnologiasDominadas = "SELECT Tecnologia FROM tecnologias_dominadas WHERE Candidato_ID = '$idCandidato'";
     $resultadoTecnologiasDominadas = mysqli_query($conexion, $consultaTecnologiasDominadas);
 
     if ($resultadoTecnologiasDominadas && mysqli_num_rows($resultadoTecnologiasDominadas) > 0) {
         $tecnologiasDominadas = [];
         while ($tec = mysqli_fetch_assoc($resultadoTecnologiasDominadas)) {
             $tecnologiasDominadas[] = strtolower(trim($tec['Tecnologia'])); // Normalizamos las tecnologías (minúsculas y sin espacios)
         }
     } else {
         $response['error'] = 'No se encontraron las tecnologías dominadas por el candidato.';
         echo json_encode($response);
         exit();
     }

    // Consultar vacantes que coincidan con la modalidad de trabajo
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
            (SELECT COUNT(*) FROM postulaciones WHERE postulaciones.Vacante_ID = vacante.ID) AS Cantidad_Postulados, 
            empresa.ID AS Empresa_ID,
            empresa.Nombre AS Empresa_Nombre,
            empresa.Logo AS Empresa_Logo
        FROM vacante
        INNER JOIN modalidad_trabajo ON vacante.Modalidad = modalidad_trabajo.ID
        INNER JOIN estado ON vacante.Estado = estado.ID
        INNER JOIN empresa ON vacante.Empresa_ID = empresa.ID
        LEFT JOIN postulaciones ON vacante.ID = postulaciones.Vacante_ID  
        WHERE vacante.Modalidad = '$idModalidad_Trabajo' 
        GROUP BY vacante.ID
    ";

    $resultadoVacantes = mysqli_query($conexion, $consultaVacantes);

    if (!$resultadoVacantes) {
        error_log("Error al consultar vacantes: " . mysqli_error($conexion));
        echo json_encode(['error' => 'Error al consultar las vacantes.']);
        http_response_code(500);
        exit();
    }

    // Inicializar un array para almacenar las vacantes
    $vacantesRecomendadas = [];
 
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
            $tecnologiasRequeridas[] = strtolower(trim($tecVacante['Tecnologia'])); // Normalizamos las tecnologías (minúsculas y sin espacios)
        }

        // Contar coincidencias entre las tecnologías dominadas por el candidato y las tecnologías requeridas por la vacante
        $coincidencias = 0;
        foreach ($tecnologiasDominadas as $tecDominada) {
            if (in_array($tecDominada, $tecnologiasRequeridas)) {
                $coincidencias++;
            }
        }

        // Si hay coincidencias, agregar la vacante a las recomendaciones
        if ($coincidencias > 0) {
            $vacantesRecomendadas[] = array_merge($vacante, ['coincidencias' => $coincidencias]);
        }
    }

    // Ordenar vacantes por el número de coincidencias de tecnologías (de mayor a menor)
    usort($vacantesRecomendadas, function($a, $b) {
        return $b['coincidencias'] - $a['coincidencias'];
    });

    // Retornar las vacantes recomendadas
    echo json_encode([
        'success' => true,
        'vacantes' => $vacantesRecomendadas
    ]);

} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
