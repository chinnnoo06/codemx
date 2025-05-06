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

    if (!isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID del candidato.']);
        http_response_code(400);
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    $query = "
    SELECT 
        e.ID, e.Nombre, e.Logo,
        COALESCE(f.Seguidores, 0) AS Seguidores,
        COALESCE(p.TotalLikes, 0) AS Likes,
        COALESCE(p.TotalDislikes, 0) AS Dislikes,
        COALESCE(p.TotalComentarios, 0) AS Comentarios,
        COALESCE(p.NumPublicaciones, 1) AS NumPublicaciones,
        (
            (
                (COALESCE(f.Seguidores, 0) * 1.0) +
                (COALESCE(p.TotalLikes, 0) * 1.5) +
                (COALESCE(p.TotalComentarios, 0) * 1.2) -
                (COALESCE(p.TotalDislikes, 0) * 1.3)
            ) / COALESCE(p.NumPublicaciones, 1)
        ) AS ScoreBruto
    FROM empresa e
    LEFT JOIN (
        SELECT Empresa_ID, COUNT(*) AS Seguidores
        FROM seguidores
        GROUP BY Empresa_ID
    ) f ON f.Empresa_ID = e.ID
    LEFT JOIN (
        SELECT 
            Empresa_ID,
            COUNT(*) AS NumPublicaciones,
            SUM(CASE WHEN Ocultar_MeGusta = 0 THEN 1 ELSE 0 END) AS TotalLikes,
            SUM(CASE WHEN Ocultar_MeGusta = 1 THEN 1 ELSE 0 END) AS TotalDislikes,
            SUM(CASE WHEN Sin_Comentarios = 0 THEN 1 ELSE 0 END) AS TotalComentarios
        FROM publicacion
        GROUP BY Empresa_ID
    ) p ON p.Empresa_ID = e.ID
    WHERE e.ID NOT IN (
        SELECT Empresa_ID FROM seguidores WHERE Candidato_ID = '$idCandidato'
    )
    ORDER BY ScoreBruto DESC
    LIMIT 20;
    ";

    $resultado = mysqli_query($conexion, $query);
    $empresas = [];

    while ($fila = mysqli_fetch_assoc($resultado)) {
        $empresas[] = [
            'ID' => $fila['ID'],
            'Nombre' => $fila['Nombre'],
            'Logo' => $fila['Logo']
        ];
    }

    echo json_encode([
        'success' => true,
        'empresas' => $empresas
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
