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
    // Obtén el cuerpo de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que el idPublicacion esté presente
    if (!isset($data['idPublicacion'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el ID de la Publicacion.']);
        http_response_code(400); // Bad Request
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);

    // 1️⃣ Obtener la ruta de la imagen antes de eliminar la publicación
    $consultaImg = "SELECT Img FROM publicacion WHERE ID = '$idPublicacion'";
    $resultadoImg = mysqli_query($conexion, $consultaImg);

    if ($resultadoImg && mysqli_num_rows($resultadoImg) > 0) {
        $fila = mysqli_fetch_assoc($resultadoImg);
        $imgRutaCompleta = $fila['Img'];

        // 2️⃣ Eliminar la imagen del servidor
        if ($imgRutaCompleta) {
            // Convertir la URL en una ruta del servidor de forma manual
            $imgRutaServidor = str_replace("https://codemx.net/codemx/public", "/var/www/codemx/public", $imgRutaCompleta);

            // Verificar si el archivo existe antes de eliminarlo
            if (file_exists($imgRutaServidor)) {
                unlink($imgRutaServidor);
                echo json_encode(['success' => true, 'message' => 'Imagen eliminada correctamente.']);
            } else {
                echo json_encode(['success' => false, 'error' => 'La imagen no existe en el servidor.']);
            }
        }
    }

    // 3️⃣ Eliminar la publicación de la base de datos
    $consulta = "DELETE FROM publicacion WHERE ID = '$idPublicacion'";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Publicación eliminada correctamente.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al eliminar: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
