<?php
$host = 'localhost'; // Dirección del servidor MySQL
$username = "u499414612_codemx_user"; // Usuario de tu base de datos
$password = 'Mandarino254'; // Contraseña del usuario
$dbname = "u499414612_codemx"; // Nombre de tu base de datos

// Conexión a la base de datos con mysqli
$conexion = mysqli_connect($host, $username, $password, $dbname);

// Verificar la conexión
if (!$conexion) {
    die("Error al conectar a la base de datos: " . mysqli_connect_error());
}
?>
