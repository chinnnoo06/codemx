<?php
require_once '../config/conexion.php';

// Encabezados para habilitar CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    // Obtener datos de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idPublicacion'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el ID de la Publicación.']);
        http_response_code(400);
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);

    // 1️⃣ Obtener la ruta de la imagen desde la BD
    $consultaImg = "SELECT Img FROM publicacion WHERE ID = '$idPublicacion'";
    $resultadoImg = mysqli_query($conexion, $consultaImg);

    if ($resultadoImg && mysqli_num_rows($resultadoImg) > 0) {
        $fila = mysqli_fetch_assoc($resultadoImg);
        $imgRutaCompleta = $fila['Img'];

        if ($imgRutaCompleta) {
            // 2️⃣ Obtener el nombre del archivo sin la URL
            $imgNombre = basename($imgRutaCompleta);
            
            // 3️⃣ Construir la ruta absoluta correcta en el servidor
            $imgRutaServidor = $_SERVER['DOCUMENT_ROOT'] . "/codemx/public/resources/publicaciones/" . $imgNombre;

            // 4️⃣ Verificar si el archivo existe antes de eliminarlo
            if (file_exists($imgRutaServidor)) {
                if (unlink($imgRutaServidor)) {
                    echo json_encode(['success' => true, 'message' => 'Imagen eliminada correctamente.']);
                } else {
                    echo json_encode(['success' => false, 'error' => 'No se pudo eliminar la imagen.']);
                }
            } else {
                echo json_encode(['success' => false, 'error' => 'La imagen no existe en el servidor. Ruta: ' . $imgRutaServidor]);
            }
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró la imagen en la base de datos.']);
    }

    // 5️⃣ Eliminar la publicación de la base de datos
    $consulta = "DELETE FROM publicacion WHERE ID = '$idPublicacion'";

    if (mysqli_query($conexion, $consulta)) {
        echo json_encode(['success' => true, 'message' => 'Publicación eliminada correctamente.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al eliminar publicación: ' . mysqli_error($conexion)]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
