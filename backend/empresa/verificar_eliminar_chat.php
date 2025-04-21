<?php
require_once '../config/conexion.php';

// Encabezados para permitir peticiones desde el frontend
$origenPermitido = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $origenPermitido");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Si es una petición OPTIONS (preflight), se termina aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    // Decodificar datos recibidos en formato JSON
    $datosRecibidos = json_decode(file_get_contents('php://input'), true);

    // Validar que los datos requeridos estén presentes
    if (!isset($datosRecibidos['idCandidato']) || !isset($datosRecibidos['idEmpresa'])) {
        echo json_encode([
            'success' => false,
            'mensaje' => 'Faltan datos: se requiere idCandidato e idEmpresa'
        ]);
        http_response_code(400); 
        exit();
    }

    // Escapar datos para prevenir inyecciones SQL
    $idCandidato = mysqli_real_escape_string($conexion, $datosRecibidos['idCandidato']);
    $idEmpresa = mysqli_real_escape_string($conexion, $datosRecibidos['idEmpresa']);

    // Consulta SQL para verificar si el candidato tiene una postulación activa (Estado_Candidato = 3)
    // a alguna vacante perteneciente a la empresa dada
    $consultaSQL = "
        SELECT postulaciones.ID
        FROM postulaciones
        INNER JOIN vacante ON postulaciones.Vacante_ID = vacante.ID
        WHERE postulaciones.Candidato_ID = '$idCandidato'
        AND vacante.Empresa_ID = '$idEmpresa'
        AND postulaciones.Estado_Candidato = 3
        LIMIT 1
    ";

    // Ejecutar la consulta
    $resultadoConsulta = mysqli_query($conexion, $consultaSQL);

    if (!$resultadoConsulta) {
        throw new Exception('Error al ejecutar la consulta SQL: ' . mysqli_error($conexion));
    }

    // Verificar si se encontró alguna postulación activa
    $tienePostulacionActiva = mysqli_num_rows($resultadoConsulta) > 0;

    // Devolver el resultado: disponible será true si NO tiene una postulación activa
    echo json_encode([
        'success' => true,
        'disponible' => !$tienePostulacionActiva,
        'mensaje' => $tienePostulacionActiva
            ? 'El candidato ya tiene una postulación activa en esta empresa.'
            : 'El candidato puede postularse, no tiene una postulación activa en esta empresa.'
    ]);

} catch (Exception $excepcion) {
    // En caso de error del servidor
    echo json_encode([
        'success' => false,
        'mensaje' => 'Error del servidor: ' . $excepcion->getMessage()
    ]);
}
?>
