<?php
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['Correo_Electronico']);
    $password = $_POST['Password'];

    $consulta = "
    SELECT 
        'candidato' AS tipo, 
        candidato.ID, 
        candidato.Password, 
        verificacion_usuarios.Correo_Verificado, 
        verificacion_usuarios.Estado_Cuenta, 
        NULL AS RFC_Verificado
    FROM candidato
    LEFT JOIN verificacion_usuarios ON verificacion_usuarios.Candidato_ID = candidato.ID
    WHERE candidato.Email = '$email'
    UNION
    SELECT 
        'empresa' AS tipo, 
        empresa.ID, 
        empresa.Password, 
        verificacion_usuarios.Correo_Verificado, 
        verificacion_usuarios.Estado_Cuenta, 
        verificacion_usuarios.RFC_Verificado
    FROM empresa
    LEFT JOIN verificacion_usuarios ON verificacion_usuarios.Empresa_ID = empresa.ID
    WHERE empresa.Email = '$email'
    LIMIT 1";

    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        echo json_encode(['success' => false, 'error' => 'Error en la consulta SQL: ' . mysqli_error($conexion)]);
        exit();
    }

    $fila = mysqli_fetch_assoc($resultado);

    if ($fila && password_verify($password, $fila['Password'])) {

        if ($fila['tipo'] === 'candidato') {
            if ($fila['Correo_Verificado'] == 1 && $fila['Estado_Cuenta'] == 1) {
                session_start();
                $_SESSION['usuario'] = $email;
                echo json_encode(['success' => true, 'tipo' => $fila['tipo']]);
                exit();
            } elseif ($fila['Correo_Verificado'] == 0 && $fila['Estado_Cuenta'] == 1) {
                echo json_encode(['success' => true, 'redirect' => '/falta-verificar-correo', 'message' => 'Tu correo no está verificado.']);
                exit();
            } elseif ($fila['Correo_Verificado'] == 1 && $fila['Estado_Cuenta'] == 0) {
                echo json_encode(['success' => false,  'message' => 'Tu cuenta está deshabilitada.']);
                exit();
            } else {
                echo json_encode(['success' => false, 'error' => 'Tu cuenta no está activa o el correo no ha sido verificado.']);
                exit();
            }
        } elseif ($fila['tipo'] === 'empresa'){
            if ($fila['Correo_Verificado'] == 1 && $fila['Estado_Cuenta'] == 1 && $fila['RFC_Verificado'] == 1) {
                session_start();
                $_SESSION['usuario'] = $email;
                echo json_encode(['success' => true, 'tipo' => $fila['tipo']]);
                exit();
            } elseif ($fila['Correo_Verificado'] == 1 && $fila['Estado_Cuenta'] == 1 && $fila['RFC_Verificado'] == 0) {
                echo json_encode(['success' => false, 'redirect' => '/falta-verificar-rfc', 'message' => 'Falta verificar el RFC de tu cuenta.']);
                exit();
            } elseif ($fila['Correo_Verificado'] == 0 && $fila['Estado_Cuenta'] == 1 && $fila['RFC_Verificado'] == 0) {
                echo json_encode(['success' => false, 'redirect' => '/falta-verificar-correo', 'message' => 'Tu correo no está verificado.']);
                exit();
            } elseif ($fila['Correo_Verificado'] == 1 && $fila['Estado_Cuenta'] == 0 && $fila['RFC_Verificado'] == 1) {
                echo json_encode(['success' => false, 'message' => 'Tu cuenta está deshabilitada.']);
                exit();
            } else {
                echo json_encode(['success' => false, 'error' => 'Tu cuenta no está activa, el correo no ha sido verificado, o falta la verificación del RFC.']);
                exit();
            }
        }
        
    } else {
        echo json_encode(['success' => false, 'error' => 'Correo o contraseña incorrectos.']);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido.']);
}
?>
