<?php
require_once '../config/conexion.php';

// Configuración de CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Manejo del método OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'error' => 'Datos JSON inválidos']);
        http_response_code(400);
        exit();
    }

    // Validación de datos requeridos
    $requiredFields = ['idDenuncia', 'idDenunciado', 'nuevoEstado', 'tipo', 'nombreDenunciado', 'apellidoDenunciado'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            echo json_encode(['success' => false, 'error' => "Falta el campo requerido: $field"]);
            http_response_code(400);
            exit();
        }
    }

    // Sanitización de datos
    $idDenuncia = mysqli_real_escape_string($conexion, $data['idDenuncia']);
    $idDenunciado = mysqli_real_escape_string($conexion, $data['idDenunciado']);
    $estado = intval($data['nuevoEstado']);
    $tipo = mysqli_real_escape_string($conexion, $data['tipo']);
    $nombreDenunciado = mysqli_real_escape_string($conexion, $data['nombreDenunciado']);
    $apellidoDenunciado = mysqli_real_escape_string($conexion, $data['apellidoDenunciado']);
    $fechaActual = date('Y-m-d H:i:s');
    $tipoEvento = 'strike';
    $descripcion = "¡Hola $nombreDenunciado $apellidoDenunciado! Tu cuenta ha recibido un strike a causa de una denuncia de un acto que infrinja las normas de la plataforma, que no vuelva a suceder.";

    // Determinar la tabla según el tipo
    $tabla = '';
    switch ($tipo) {
        case 'CandidatoCandidato':
            $tabla = 'denuncias_candidato_candidato';
            $campoNotificacion = 'Candidato_ID';
            break;
        case 'CandidatoEmpresa':
            $tabla = 'denuncias_candidato_empresa';
            $campoNotificacion = 'Empresa_ID';
            break;
        case 'EmpresaCandidato':
            $tabla = 'denuncias_empresa_candidato';
            $campoNotificacion = 'Candidato_ID';
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Tipo de denuncia no válido']);
            http_response_code(400);
            exit();
    }

    // Estado de denuncia (2 = Aceptada, 3 = Rechazada)
    $estadoDenuncia = ($estado == 1) ? 2 : 3;

    // Iniciar transacción
    mysqli_begin_transaction($conexion);

    try {
        // Actualizar estado de denuncia
        $consulta = "UPDATE $tabla SET Estado_Denuncia = $estadoDenuncia WHERE ID = $idDenuncia";
        $resultConsulta = mysqli_query($conexion, $consulta);

        if (!$resultConsulta) {
            throw new Exception('Error al actualizar denuncia: ' . mysqli_error($conexion));
        }

        // Si se acepta la denuncia, crear notificación
        if ($estado == 1) {
            $consultaNoti = "INSERT INTO notificaciones ($campoNotificacion, Tipo_Evento, Descripcion, Fecha_Creacion)
                            VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
            $resultConsultaNoti = mysqli_query($conexion, $consultaNoti);

            if (!$resultConsultaNoti) {
                throw new Exception('Error al crear notificación: ' . mysqli_error($conexion));
            }
        }

        // Confirmar transacción
        mysqli_commit($conexion);

        echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
    } catch (Exception $e) {
        // Revertir transacción en caso de error
        mysqli_rollback($conexion);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        http_response_code(500);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>