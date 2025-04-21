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
        echo json_encode(['resultado' => false]);
        http_response_code(400);
        exit();
    }

    // Escapar los valores para mayor seguridad
    $idCandidato = mysqli_real_escape_string($conexion, $datosRecibidos['idCandidato']);
    $idEmpresa = mysqli_real_escape_string($conexion, $datosRecibidos['idEmpresa']);

    // Consulta para verificar si hay alguna postulación activa del candidato en vacantes de esa empresa
    $consultaSQL = "
        SELECT postulaciones.ID
        FROM postulaciones
        INNER JOIN vacante ON postulaciones.Vacante_ID = vacante.ID
        WHERE postulaciones.Candidato_ID = '$idCandidato'
        AND vacante.Empresa_ID = '$idEmpresa'
        AND postulaciones.Estado_Candidato = 3
        LIMIT 1
    ";

    $resultadoConsulta = mysqli_query($conexion, $consultaSQL);

    if (!$resultadoConsulta) {
        throw new Exception('Error al ejecutar la consulta: ' . mysqli_error($conexion));
    }

    // Si encontró al menos una postulación activa, devolver false; si no, true
    $existePostulacionActiva = mysqli_num_rows($resultadoConsulta) > 0;
    echo json_encode(['resultado' => !$existePostulacionActiva]);

} catch (Exception $excepcion) {
    // En caso de error, asumimos que no puede postularse
    echo json_encode(['resultado' => false]);
}
?>
