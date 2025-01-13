<?php
require_once '../config/conexion.php';

/*session_start();

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado.']);
    exit();
}

$email = $_SESSION['usuario'];
*/


try {
    // Consultar el ID y la foto del candidato asociado al email
    /*$consulta = "
        SELECT 
            ID,
            Fotografia 
        FROM candidato 
        WHERE Email = '$email'
        LIMIT 1
    ";*/
    $consulta = "
        SELECT 
            ID,
            Fotografia 
        FROM candidato 
        WHERE ID = 1
        LIMIT 1
    ";

    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . mysqli_error($conexion)]);
        exit();
    }

    $fila = mysqli_fetch_assoc($resultado);

    if ($fila) {
        echo json_encode([
            'success' => true,
            'id' => $fila['ID'],
            'fotografia' => $fila['Fotografia']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se encontró al candidato.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
