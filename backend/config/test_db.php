<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Datos de conexión
$servername = "localhost"; // O el servidor que te indica Hostinguer
$username = "u499414612_codemx_user"; // Usuario de tu base de datos
$password = "Mandarino254"; // Contraseña de tu base de datos
$dbname = "u499414612_codemx"; // Nombre de tu base de datos

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

echo "Conexión exitosa a la base de datos";
$conn->close();
?>
