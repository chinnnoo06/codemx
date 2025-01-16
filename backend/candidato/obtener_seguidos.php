<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $idCandidato = file_get_contents('php://input'); 

    // Verificar si el candidato sigue a alguna empresa
    $consultaSiguiendo = "
        SELECT empresas.Empresa_ID, empresas.Nombre, empresas.Email
        FROM seguidores
        INNER JOIN empresas ON seguidores.Empresa_ID = empresas.Empresa_ID
        WHERE seguidores.Candidato_ID = '$idCandidato'
    ";
    $resultado = mysqli_query($conexion, $consultaSiguiendo);

    if (mysqli_num_rows($resultado) > 0) {
        $listaDeEmpresas = [];
        while ($fila = mysqli_fetch_assoc($resultado)) {
            $listaDeEmpresas[] = $fila;
        }

        $cantidadDeEmpresas = count($listaDeEmpresas);

        // Respuesta con la cantidad de empresas y sus detalles
        echo json_encode([
            'cantidad' => $cantidadDeEmpresas,
            'empresas' => $listaDeEmpresas
        ]);
    } else {
        echo json_encode(['error' => 'El candidato no sigue a ninguna empresa.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
}
?>
