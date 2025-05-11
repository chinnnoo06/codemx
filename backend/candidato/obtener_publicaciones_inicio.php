
<?php
require_once '../config/conexion.php';

// Encabezados para CORS
$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que las empresas fueron enviadas
    if (!isset($data['empresas']) || !isset($data['idCandidato']) || !isset($data['page'])) {
        echo json_encode(['error' => 'Faltan datos.']);
        http_response_code(400);
        exit();
    }

    $empresas = $data['empresas']; // Empresas a obtener las publicaciones
    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);
    $page = (int)$data['page'];
    $limit = 5;  // Número de vacantes a devolver por página
    $offset = ($page - 1) * $limit; // Calcular el offset según la página

    // Consultas para obtener las publicaciones de las empresas que sigue el candidato
    $queryPublicacionesSeguidas = "
        SELECT p.ID, p.Empresa_ID, p.Contenido, p.Img, p.Fecha_Publicacion, p.Ocultar_MeGusta, p.Sin_Comentarios, 
               e.Logo AS Empresa_Logo, e.Nombre AS Empresa_Nombre,
               IF( EXISTS( SELECT 1 FROM reacciones WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ) 
                   OR EXISTS( SELECT 1 FROM comentarios WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ), 1, 0) AS Visto
        FROM publicacion p
        JOIN empresa e ON p.Empresa_ID = e.ID
        WHERE p.Empresa_ID IN (
            SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'
        )
    ";

    // Consultas para obtener las publicaciones de las empresas que NO sigue el candidato
    $queryPublicacionesNoSeguidas = "
        SELECT p.ID, p.Empresa_ID, p.Contenido, p.Img, p.Fecha_Publicacion, p.Ocultar_MeGusta, p.Sin_Comentarios, 
               e.Logo AS Empresa_Logo, e.Nombre AS Empresa_Nombre,
               IF( EXISTS( SELECT 1 FROM reacciones WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ) 
                   OR EXISTS( SELECT 1 FROM comentarios WHERE Publicacion_ID = p.ID AND Candidato_ID = '$idCandidato' ), 1, 0) AS Visto
        FROM publicacion p
        JOIN empresa e ON p.Empresa_ID = e.ID
        WHERE p.Empresa_ID IN (" . implode(',', array_map(function($empresa) { return $empresa['ID']; }, $empresas)) . ") 
        AND p.Empresa_ID NOT IN (
            SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'
        )
    ";

    // Ejecutar las consultas para obtener publicaciones de empresas seguidas
    $resultadoSeguidas = mysqli_query($conexion, $queryPublicacionesSeguidas);
    $publicacionesSeguidas = [];
    while ($row = mysqli_fetch_assoc($resultadoSeguidas)) {
        $publicacionesSeguidas[] = $row;
    }

    // Ejecutar las consultas para obtener publicaciones de empresas no seguidas
    $resultadoNoSeguidas = mysqli_query($conexion, $queryPublicacionesNoSeguidas);
    $publicacionesNoSeguidas = [];
    while ($row = mysqli_fetch_assoc($resultadoNoSeguidas)) {
        $publicacionesNoSeguidas[] = $row;
    }

    // Combinar ambas listas de publicaciones (seguidas + no seguidas)
    $publicaciones = array_merge($publicacionesSeguidas, $publicacionesNoSeguidas);

    // Ordenar las publicaciones por Visto (no vistas primero) y luego por Fecha_Publicacion (descendente)
    usort($publicaciones, function($a, $b) {
        // Primero ordenamos por el estado de Visto (0 = no visto, 1 = visto)
        if ($a['Visto'] == $b['Visto']) {
            // Si ambas publicaciones tienen el mismo estado de vista, ordenamos por fecha
            return strtotime($b['Fecha_Publicacion']) - strtotime($a['Fecha_Publicacion']);
        }
        return $a['Visto'] - $b['Visto']; // No vistas primero (0 al principio)
    });

     $publicacionesPaginadas = array_slice($publicaciones, $offset, $limit);

    // Si no hay publicaciones
    if (count($publicaciones) === 0) {
        echo json_encode([
            'success' => true,
            'publicaciones' => []
        ]);
        exit();
    }

    echo json_encode([
        'success' => true,
        'publicaciones' => $publicacionesPaginadas
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
