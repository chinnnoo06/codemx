<?php
require_once '../config/conexion.php';

// Configuración de CORS (Cross-Origin Resource Sharing)
$origenPermitido = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $origenPermitido");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "
        SELECT 
            t.ID AS Tecnologia_ID,
            t.Tecnologia,
            COUNT(tv.Vacante_ID) AS Veces_Solicitada
        FROM tecnologias_vacante tv
        LEFT JOIN tecnologias t ON tv.Tecnologia_ID = t.ID
        WHERE t.ID IS NOT NULL
        GROUP BY tv.Tecnologia_ID, t.Tecnologia
        ORDER BY Veces_Solicitada DESC
        LIMIT 10
    ";


    $resultado = $mysqli->query($sql);

    if ($resultado) {
        $tecnologias = [];
        while ($fila = $resultado->fetch_assoc()) {
            $tecnologias[] = [
                'id' => $fila['Tecnologia_ID'],
                'nombre' => $fila['Tecnologia'],
                'cantidad' => (int) $fila['Veces_Solicitada']
            ];
        }
        echo json_encode($tecnologias);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al ejecutar la consulta.']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
