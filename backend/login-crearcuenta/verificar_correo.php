<?php
require_once '../config/conexion.php';

if (isset($_GET['token'])) {
    $token = mysqli_real_escape_string($conexion, $_GET['token']);
    echo "Token recibido: $token<br>";

    $fechaActual = date('Y-m-d H:i:s');

    // Consulta para verificar el token
    $consulta = "SELECT * FROM verificacion_usuarios WHERE Token_Verificacion = '$token' AND Correo_Verificado = 0 AND Fecha_Expiracion_Token > '$fechaActual'";
    $resultado = mysqli_query($conexion, $consulta);

    if (!$resultado) {
        die('Error en la consulta SQL: ' . mysqli_error($conexion));
    }

    if (mysqli_num_rows($resultado) > 0) {
        $row = mysqli_fetch_assoc($resultado);
        $candidatoId = $row['Candidato_ID'];
        echo "Candidato ID: $candidatoId<br>";

        // Actualizar el estado de verificación
        $update = "UPDATE verificacion_usuarios SET Correo_Verificado = 1, Fecha_Actualizacion = '$fechaActual'  WHERE  (Candidato_ID = '$candidatoId' OR Empresa_ID = '$empresaId')";
        if (mysqli_query($conexion, $update)) {
            // Redirigir al usuario a la página de inicio de sesión
            header('Location: https://codemx.net/codemx/frontend/build/iniciar-sesion'); 
            exit();
        } else {
            die('Error al verificar la cuenta: ' . mysqli_error($conexion));
        }
    } else {
        echo '
            <div style="text-align: center; margin-top: 20px;">
                <p style="color: red;">El token es inválido o ha expirado. Ingrese al link e ingrese sus credenciales para poder general un nuevo token.</p>
                <a href="https://codemx.net/codemx/frontend/build/iniciar-sesion" style="text-decoration: none;">
                    <button style="padding: 10px 20px; font-size: 16px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Ir a Iniciar Sesión
                    </button>
                </a>
            </div>
        ';
    }
} else {
    echo 'No se proporcionó un token válido.';
}
?>
