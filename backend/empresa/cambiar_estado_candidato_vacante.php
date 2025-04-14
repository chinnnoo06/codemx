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

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato']) || !isset($data['idVacante']) || !isset($data['idEmpresa']) || !isset($data['estadoNuevo'])) {
        echo json_encode(['error' => 'Faltan parámetros necesarios.']);
        http_response_code(400); // Bad Request
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $idVacante = mysqli_real_escape_string($conexion, $data['idVacante']);
    $idEmpresa = mysqli_real_escape_string($conexion, $data['idEmpresa']);
    $estadoNuevo = mysqli_real_escape_string($conexion, $data['estadoNuevo']);

    // Actualizar estado de la postulación
    $consulta = "UPDATE postulaciones 
                 SET Estado_Candidato = '$estadoNuevo' 
                 WHERE Vacante_ID = '$idVacante' AND Candidato_ID = '$idCandidato'";

    if (!mysqli_query($conexion, $consulta)) {
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
    }

    if ($estadoNuevo == 3) {
        $chatID = null;

        // Verificar si ya hay un chat
        $consultaVerificarChat = "SELECT ID FROM chats 
                                  WHERE Candidato_ID = '$idCandidato' AND Empresa_ID = '$idEmpresa'";
        $resultadoChat = mysqli_query($conexion, $consultaVerificarChat);

        if ($resultadoChat && mysqli_num_rows($resultadoChat) > 0) {
            $filaChat = mysqli_fetch_assoc($resultadoChat);
            $chatID = $filaChat['ID'];
        } else {
            // Crear chat si no existe
            $fechaCreacion = date('Y-m-d H:i:s');
            $crearChat = "INSERT INTO chats (Candidato_ID, Empresa_ID, Fecha_Creacion) 
                          VALUES ('$idCandidato', '$idEmpresa', '$fechaCreacion')";

            if (mysqli_query($conexion, $crearChat)) {
                $chatID = mysqli_insert_id($conexion); // Obtener el ID del nuevo chat
            } else {
                die(json_encode(['error' => 'Error al crear el chat: ' . mysqli_error($conexion)]));
            }
        }

        // Enviar mensaje automático
        $mensaje = "Tu vacante ha sido aceptada, inicia el proceso de contratación.";
        $fechaEnvio = date('Y-m-d H:i:s');
        $usuario = "empresa"; // o "sistema", como prefieras

        $consultaEnviarMensaje = "INSERT INTO mensajes (Chat_ID, Usuario, Mensaje, Fecha_Envio)
                                  VALUES ('$chatID', '$usuario', '$mensaje', '$fechaEnvio')";

        if (!mysqli_query($conexion, $consultaEnviarMensaje)) {
            die(json_encode(['error' => 'Error al enviar el mensaje: ' . mysqli_error($conexion)]));
        }
    }

    echo json_encode(['success' => 'Estado cambiado correctamente']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
