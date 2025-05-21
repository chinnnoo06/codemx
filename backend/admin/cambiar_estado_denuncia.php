<?php
require_once '../config/conexion.php';

// Configuración de CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejo del método OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validación de los datos
    if (!isset($data['idDenuncia']) || !isset($data['idDenunciado']) || !isset($data['nuevoEstado']) || !isset($data['tipo']) || !isset($data['nombreDenunciado']) || !isset($data['apellidoDenunciado'])) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos esenciales para procesar la denuncia.']);
        http_response_code(400);
        exit();
    }

    // Escapando los datos para prevenir SQL Injection
    $idDenuncia = mysqli_real_escape_string($conexion, $data['idDenuncia']);
    $idDenunciado = mysqli_real_escape_string($conexion, $data['idDenunciado']);
    $estado = mysqli_real_escape_string($conexion, $data['nuevoEstado']);
    $tipo = mysqli_real_escape_string($conexion, $data['tipo']);
    $nombreDenunciado = mysqli_real_escape_string($conexion, $data['nombreDenunciado']);
    $apellidoDenunciado = mysqli_real_escape_string($conexion, $data['apellidoDenunciado']);
    $fechaActual = date('Y-m-d H:i:s');
    $tipoEvento = 'strike';
    $descripcion = "¡Hola $nombreDenunciado $apellidoDenunciado! Tu cuenta ha recibido un strike a causa de una denuncia de un acto que infrinja las normas de la plataforma, que no vuelva a suceder.";

    // Iniciamos una transacción para asegurar la integridad de los datos
    mysqli_begin_transaction($conexion);

    try {
        if ($estado == 1) {
            if ($tipo == "CandidatoCandidato") {
                $consulta = "UPDATE denuncia_candidato_candidato SET Estado_Denuncia = 2 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncias_candidato_candidato.");
                }

                $consultaNoti = "INSERT INTO notificaciones (Candidato_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
                                VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
                if (!mysqli_query($conexion, $consultaNoti)) {
                    throw new Exception("Error al insertar la notificación.");
                }
                echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
            }

            if ($tipo == "CandidatoEmpresa") {
                $consulta = "UPDATE denuncia_candidato_empresa SET Estado_Denuncia = 2 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncias_candidato_empresa.");
                }

                $consultaNoti = "INSERT INTO notificaciones (Empresa_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
                                VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
                if (!mysqli_query($conexion, $consultaNoti)) {
                    throw new Exception("Error al insertar la notificación.");
                }
                echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
            }

            if ($tipo == "EmpresaCandidato") {
                $consulta = "UPDATE denuncia_empresa_candidato SET Estado_Denuncia = 2 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncias_empresa_candidato.");
                }

                $consultaNoti = "INSERT INTO notificaciones (Candidato_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
                                VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
                if (!mysqli_query($conexion, $consultaNoti)) {
                    throw new Exception("Error al insertar la notificación.");
                }
                echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
            }
        } else if ($estado == 0) {
            if ($tipo == "CandidatoCandidato") {
                $consulta = "UPDATE denuncia_candidato_candidato SET Estado_Denuncia = 3 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncias_candidato_candidato.");
                }
                echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
            }

            if ($tipo == "CandidatoEmpresa") {
                $consulta = "UPDATE denuncia_candidato_empresa SET Estado_Denuncia = 3 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncias_candidato_empresa.");
                }
                echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
            }

            if ($tipo == "EmpresaCandidato") {
                $consulta = "UPDATE denuncia_empresa_candidato SET Estado_Denuncia = 3 WHERE ID = $idDenuncia";
                if (!mysqli_query($conexion, $consulta)) {
                    throw new Exception("Error al actualizar el estado de la denuncia en denuncias_empresa_candidato.");
                }
                echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
            }
        }

        // Commit de la transacción si todo sale bien
        mysqli_commit($conexion);
    } catch (Exception $e) {
        // Si ocurre algún error, hacemos un rollback y mostramos el error
        mysqli_rollback($conexion);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        http_response_code(500);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
