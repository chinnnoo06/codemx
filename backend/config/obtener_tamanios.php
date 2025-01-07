<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

// Incluir archivo de conexión
include 'conexion.php';

// Consulta para obtener los tamaños de empresa
$query = "SELECT id, tamanio, cantidad FROM tamanio";
$result = mysqli_query($conexion, $query);

if ($result) {
    $tamanios= [];
    while ($row = mysqli_fetch_assoc($result)) {
        $tamanios[] = $row;
    }
    echo json_encode($tamanios);
} else {
    echo json_encode(['error' => 'Error al realizar la consulta: ' . mysqli_error($conexion)]);
}

// Cerrar la conexión
mysqli_close($conexion);
?>
