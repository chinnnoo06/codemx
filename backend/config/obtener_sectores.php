<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

// Incluir archivo de conexión
include 'conexion.php';

// Consulta para obtener los sectores
$query = "SELECT id, sector FROM sector";
$result = mysqli_query($conexion, $query);

if ($result) {
    $sectores = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $sectores[] = $row;
    }
    echo json_encode($sectores);
} else {
    echo json_encode(['error' => 'Error al realizar la consulta: ' . mysqli_error($conexion)]);
}

// Cerrar la conexión
mysqli_close($conexion);
?>
