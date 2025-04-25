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
    // Consulta las tecnologías más solicitadas por las empresas en sus vacantes
    $consultaTecnologiasMasSolicitadas = "
        SELECT tecnologias_vacante.Tecnologia_ID, tecnologias.Tecnologia AS Nombre, COUNT(*) AS cantidad
        FROM tecnologias_vacante
        INNER JOIN tecnologias ON tecnologias_vacante.Tecnologia_ID = tecnologias.ID
        GROUP BY tecnologias_vacante.Tecnologia_ID, tecnologias.Tecnologia
        ORDER BY cantidad DESC
        LIMIT 10
    ";

    // Ejecutar la consulta en la base de datos
    $resultadoTecnologiasMasSolicitadas = mysqli_query($conexion, $consultaTecnologiasMasSolicitadas);

    // Comprobar si la consulta se ejecutó correctamente
    if ($resultadoTecnologiasMasSolicitadas) {
        $tecnologiasMasSolicitadas = [];
        // Recorrer los resultados obtenidos de la consulta
        while ($fila = mysqli_fetch_assoc($resultadoTecnologiasMasSolicitadas)) {
            // Almacenar cada tecnología en un array asociativo
            $tecnologiasMasSolicitadas[] = [
                'id' => $fila['Tecnologia_ID'],
                'nombre' => $fila['Nombre'],
                'cantidad' => $fila['cantidad']
            ];
        }

        // Retornar la respuesta en formato JSON con las tecnologías más solicitadas
        echo json_encode([
            'exito' => true,
            'tecnologias' => $tecnologiasMasSolicitadas
        ]);
    } else {
        // Si ocurre un error en la consulta, se registra el error y se retorna una respuesta de error
        error_log("Error al consultar las tecnologías más solicitadas: " . mysqli_error($conexion));
        echo json_encode(['error' => 'Error al consultar las tecnologías más solicitadas.']);
        http_response_code(500);
    }

} else {
    // Si el método HTTP no es POST, se devuelve un error 405 (Método no permitido)
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
