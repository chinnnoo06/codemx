<?php
$host = 'localhost'; // Dirección del servidor MySQL
$username = 'root'; // Usuario de tu base de datos
$password = '82718640'; // Contraseña del usuario
$dbname = 'codemx'; // Nombre de tu base de datos

// Conexión a la base de datos con mysqli
$conexion = mysqli_connect($host, $username, $password, $dbname);

// Verificar la conexión
if (!$conexion) {
    die("Error al conectar a la base de datos: " . mysqli_connect_error());
}
?>
