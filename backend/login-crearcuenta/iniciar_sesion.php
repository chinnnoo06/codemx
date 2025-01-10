<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['Correo_Electronico']);
    $password = $_POST['Password'];

    $consulta = "
    SELECT 'candidato' as tipo, ID, Password FROM candidato WHERE Email='$email'
    UNION
    SELECT 'empresa' as tipo, ID, Password FROM empresa WHERE Email='$email'
    LIMIT 1";

    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        echo json_encode(['success' => false, 'error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        exit();
    }

    $fila = mysqli_fetch_assoc($resultado);

    if ($fila && password_verify($password, $fila['Password'])) {
        session_start();
        $_SESSION['usuario'] = $email;

        echo json_encode(['success' => true, 'tipo' => $fila['tipo']]);
        exit();
    } else {
        echo json_encode(['success' => false, 'error' => 'Correo o contraseña incorrectos.']);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido.']);
}
?>
