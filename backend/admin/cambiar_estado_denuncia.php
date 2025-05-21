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

    // Validación de estado
    if (!isset($data['idDenuncia']) || !isset($data['idDenunciado']) || !isset($data['nuevoEstado']) || !isset($data['tipo']) || !isset($data['nombreDenunciado']) || !isset($data['apellidoDenunciado'])) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos.']);
        http_response_code(400);
        exit();
    }

    $idDenuncia = mysqli_real_escape_string($conexion, $data['idDenuncia']);
    $idDenunciado = mysqli_real_escape_string($conexion, $data['idDenunciado']);
    $estado = mysqli_real_escape_string($conexion, $data['nuevoEstado']);
    $tipo = mysqli_real_escape_string($conexion, $data['tipo']);
    $nombreDenunciado = mysqli_real_escape_string($conexion, $data['nombreDenunciado']);
    $apellidoDenunciado = mysqli_real_escape_string($conexion, $data['apellidoDenunciado']);
    $fechaActual = date('Y-m-d H:i:s');
    $tipoEvento = 'strike';
    $descripcion = "¡Hola $nombreDenunciado $apellidoDenunciado! Tu cuenta ha recibido un strike a causa de una denuncia de un acto que infrinja las normas de la plataforma, que no vuelva a suceder.";

    if($estado == 1){
        if($tipo == "CandidatoCandidato"){
            $consulta = "UPDATE denuncias_candidato_candidato SET Estado_Denuncia = 2 WHERE ID = $idDenuncia";
            $resultConsulta = mysqli_query($conexion, $consulta);

            $consultaNoti = "INSERT INTO notificaciones (Candidato_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
            VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
            $resultConsultaNoti = mysqli_query($conexion, $consultaNoti);

            echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
        }

        if($tipo == "CandidatoEmpresa"){
            $consulta = "UPDATE denuncias_candidato_empresa SET Estado_Denuncia = 2 WHERE ID = $idDenuncia";
            $resultConsulta = mysqli_query($conexion, $consulta);

            $consultaNoti = "INSERT INTO notificaciones (Empresa_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
            VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
            $resultConsultaNoti = mysqli_query($conexion, $consultaNoti);

            echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
        }

        if($tipo == "EmpresaCandidato"){
            $consulta = "UPDATE denuncias_empresa_candidato SET Estado_Denuncia = 2 WHERE ID = $idDenuncia";
            $resultConsulta = mysqli_query($conexion, $consulta);

            $consultaNoti = "INSERT INTO notificaciones (Candidato_ID, Tipo_Evento, Descripcion, Fecha_Creacion)
            VALUES ('$idDenunciado', '$tipoEvento', '$descripcion', '$fechaActual')";
            $resultConsultaNoti = mysqli_query($conexion, $consultaNoti);

            echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
        }
    } else if ($estado == 0) {
        if($tipo == "CandidatoCandidato"){
            $consulta = "UPDATE denuncias_candidato_candidato SET Estado_Denuncia = 3 WHERE ID = $idDenuncia";
            $resultConsulta = mysqli_query($conexion, $consulta);

            echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
        }

        if($tipo == "CandidatoEmpresa"){
            $consulta = "UPDATE denuncias_candidato_empresa SET Estado_Denuncia = 3 WHERE ID = $idDenuncia";
            $resultConsulta = mysqli_query($conexion, $consulta);

            echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
        }

        if($tipo == "EmpresaCandidato"){
            $consulta = "UPDATE denuncias_empresa_candidato SET Estado_Denuncia = 3 WHERE ID = $idDenuncia";
            $resultConsulta = mysqli_query($conexion, $consulta);

            echo json_encode(['success' => true, 'message' => 'Estado de denuncia actualizado correctamente.']);
        }
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
