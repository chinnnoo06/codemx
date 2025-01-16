<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idCandidato = $_POST['idCandidato'] ?? null;

    // Verificar si el candidato sigue a alguna empresa
    $consultaSiguiendo = "
        SELECT empresa.Empresa_ID, empresa.Nombre, empresa.Email
        FROM seguidores
        INNER JOIN empresa ON seguidores.Empresa_ID = empresa.Empresa_ID
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
