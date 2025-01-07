<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

// Incluir archivo de conexión
include 'conexion.php';

// Consulta para obtener los estados
$query = "SELECT id, tecnologia FROM tecnologias";
$result = mysqli_query($conexion, $query);

if ($result) {
    $tecnologias = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $tecnologias[] = $row;
    }
    echo json_encode($tecnologias);
} else {
    echo json_encode(['error' => 'Error al realizar la consulta: ' . mysqli_error($conexion)]);
}

// Cerrar la conexión
mysqli_close($conexion);
?>
