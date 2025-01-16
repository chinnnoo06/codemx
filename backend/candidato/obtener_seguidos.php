<?php
require_once '../config/conexion.php';

// Verificar el método de la solicitud
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['idCandidato'])) {
        echo json_encode(['error' => 'Falta el ID del candidato.']);
        http_response_code(400); 
        exit();
    }

    $idCandidato = mysqli_real_escape_string($conexion, $data['idCandidato']);

    $consultaSiguiendo = "
        SELECT empresa.ID, empresa.Nombre, empresa.Logo
        FROM seguidores
        INNER JOIN empresa ON seguidores.Empresa_ID = empresa.ID
        WHERE seguidores.Candidato_ID = '$idCandidato'
    ";

    $resultado = mysqli_query($conexion, $consultaSiguiendo);

    if (!$resultado) {
        echo json_encode(['error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        http_response_code(500); 
        exit();
    }

    if (mysqli_num_rows($resultado) > 0) {
        $listaDeEmpresas = [];
        while ($fila = mysqli_fetch_assoc($resultado)) {
            $listaDeEmpresas[] = $fila;
        }

        $cantidadDeEmpresas = count($listaDeEmpresas);

        echo json_encode([
            'cantidad' => $cantidadDeEmpresas,
            'empresas' => $listaDeEmpresas
        ]);
    } else {
        echo json_encode(['cantidad' => 0, 'empresas' => [], 'error' => 'El candidato no sigue a ninguna empresa.']);
    }
} else {
    // Método no permitido
    http_response_code(405); 
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
