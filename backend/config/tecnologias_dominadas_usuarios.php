<?php
require_once '../config/conexion.php';

// Configuración de CORS (Cross-Origin Resource Sharing)
$origenPermitido = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $origenPermitido");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejo del método OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Consulta las tecnologías más comunes entre los candidatos registrados
    $consultaTecnologiasMasComunes = "
        SELECT tecnologias_dominadas.Tecnologia, tecnologias.Tecnologia, COUNT(*) AS cantidad
        FROM tecnologias_dominadas
        INNER JOIN tecnologias ON tecnologias_dominadas.Tecnologia = tecnologias.ID
        GROUP BY tecnologias_dominadas.Tecnologia, tecnologias.Tecnologia
        ORDER BY cantidad DESC
        LIMIT 10
    ";

    // Ejecutar la consulta en la base de datos
    $resultadoTecnologiasMasComunes = mysqli_query($conexion, $consultaTecnologiasMasComunes);

    // Comprobar si la consulta se ejecutó correctamente
    if ($resultadoTecnologiasMasComunes) {
        $tecnologiasMasComunes = [];
        // Recorrer los resultados obtenidos de la consulta
        while ($fila = mysqli_fetch_assoc($resultadoTecnologiasMasComunes)) {
            // Almacenar cada tecnología en un array asociativo
            $tecnologiasMasComunes[] = [
                'id' => $fila['Tecnologia_ID'],
                'nombre' => $fila['Nombre'],
                'cantidad' => $fila['cantidad']
            ];
        }

        // Retornar la respuesta en formato JSON con las tecnologías más comunes
        echo json_encode([
            'exito' => true,
            'tecnologias' => $tecnologiasMasComunes
        ]);
    } else {
        // Si ocurre un error en la consulta, se registra el error y se retorna una respuesta de error
        error_log("Error al consultar las tecnologías más comunes: " . mysqli_error($conexion));
        echo json_encode(['error' => 'Error al consultar las tecnologías más comunes.']);
        http_response_code(500);
    }

} else {
    // Si el método HTTP no es POST, se devuelve un error 405 (Método no permitido)
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
