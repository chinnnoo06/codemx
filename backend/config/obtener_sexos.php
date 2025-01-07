<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

// Incluir archivo de conexión
include 'conexion.php';

// Consulta para obtener los estados
$query = "SELECT id, sexo FROM sexo";
$result = mysqli_query($conexion, $query);

if ($result) {
    $sexos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $sexos[] = $row;
    }
    echo json_encode($sexos);
} else {
    echo json_encode(['error' => 'Error al realizar la consulta: ' . mysqli_error($conexion)]);
}

// Cerrar la conexión
mysqli_close($conexion);
?>
