<?php
if (isset($_GET['token'])) {
    // Capturamos el token de la URL
    $token = $_GET['token'];
    
    // Mostramos el token recibido
    echo "El token recibido es: " . htmlspecialchars($token);
} else {
    // Mensaje si no se proporciona el token
    echo "No se proporcionó ningún token.";
}
?>
