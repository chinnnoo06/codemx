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

try {
    // Obtener los datos de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idPublicacion'])) {
        echo json_encode(['success' => false, 'error' => 'Falta el ID de la Publicación.']);
        http_response_code(400);
        exit();
    }

    $idPublicacion = mysqli_real_escape_string($conexion, $data['idPublicacion']);

    $serverUrl = 'https://codemx.net/codemx/public';

    $consultaImg = "SELECT Img FROM publicacion WHERE ID = '$idPublicacion'";
    $resultadoImg = mysqli_query($conexion, $consultaImg);

    $fila = mysqli_fetch_assoc($resultado);
    $img = $fila['Img'];

    if ($resultadoImg && mysqli_num_rows($resultadoImg) > 0) {
         // Eliminar la foto
         $imgPath = str_replace($serverUrl, __DIR__ . '/../../public', $img);
         if (file_exists($imgPath)) {
             unlink($imgPath);
         }

        // 4️⃣ Eliminar la publicación de la base de datos
        $consultaDelete = "DELETE FROM publicacion WHERE ID = '$idPublicacion'";
        if (mysqli_query($conexion, $consultaDelete)) {
            echo json_encode([
                'success' => true, 
                'message' => 'Publicación eliminada correctamente.',
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'error' => 'Error al eliminar la publicación: ' . mysqli_error($conexion)
            ]);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró la imagen en la base de datos.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
