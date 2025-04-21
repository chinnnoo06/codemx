<?php
require_once '../config/conexion.php';

// Encabezados para habilitar CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
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

    // Obtener todos los chats del candidato con datos de empresa, ordenados por el último mensaje
    $queryChats = "
        SELECT 
            chats.ID AS Chat_ID,
            chats.Fecha_Creacion,
            candidato.ID AS Candidato_ID,
            candidato.Nombre AS Candidato_Nombre,
            candidato.Apellido AS Candidato_Apellido,
            candidato.Fotografia AS Candidato_Fotografia,
            (SELECT Fecha_Envio FROM mensajes WHERE Chat_ID = chats.ID ORDER BY Fecha_Envio DESC LIMIT 1) AS Ultimo_Mensaje_Fecha
        FROM chats
        INNER JOIN candidato ON chats.Candidato_ID = candidato.ID
        WHERE chats.Empresa_ID = '$idEmpresa'
        ORDER BY Ultimo_Mensaje_Fecha DESC
    ";

    $resultadoChats = mysqli_query($conexion, $queryChats);

    if (!$resultadoChats) {
        echo json_encode(['error' => 'Error al obtener los chats: ' . mysqli_error($conexion)]);
        http_response_code(500);
        exit();
    }

    $chats = [];

    while ($chat = mysqli_fetch_assoc($resultadoChats)) {
        $chatID = $chat['Chat_ID'];

        // Obtener el último mensaje del chat
        $queryUltimoMensaje = "
            SELECT 
                ID AS Mensaje_ID,
                Usuario,
                Mensaje,
                Lectura,
                Fecha_Envio
            FROM mensajes
            WHERE Chat_ID = '$chatID'
            ORDER BY Fecha_Envio DESC
            LIMIT 1
        ";

        $resultadoUltimoMensaje = mysqli_query($conexion, $queryUltimoMensaje);
        $ultimoMensaje = null;

        if ($resultadoUltimoMensaje && mysqli_num_rows($resultadoUltimoMensaje) > 0) {
            $ultimoMensaje = mysqli_fetch_assoc($resultadoUltimoMensaje);
        }

        $chat['Ultimo_Mensaje'] = $ultimoMensaje;
        $chats[] = $chat;
    }

    echo json_encode(['chats' => $chats]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
