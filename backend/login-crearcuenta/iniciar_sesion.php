<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Datos recibidos del formulario
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $Password = $_POST['Password'];

    $consulta = "
    SELECT 'candidato' as tipo, ID, Password FROM Candidato WHERE Email='$Email'
    UNION
    SELECT 'empresa' as tipo, ID, Password FROM Empresa WHERE Email='$Email'
    LIMIT 1";

    $resultado = mysqli_query($conexion, $consulta);
    $fila = mysqli_fetch_assoc($resultado);

    if ($fila && password_verify($Password, $fila['Password'])) {
        session_start();
        $_SESSION['usuario'] = $email;

        echo json_encode(['success' => true, 'tipo' => $fila['tipo']]); 
        exit();
    } else {
        // Si no se encuentra el usuario o la contraseña es incorrecta
        die(json_encode(['error' => 'Error al guardar en la base de datos: ' . mysqli_error($conexion)]));
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
