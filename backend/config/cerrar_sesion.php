<?php
session_start();
session_unset();
session_destroy();

// Configurar la cabecera para que el cliente sepa que la respuesta es JSON
header('Content-Type: application/json');

// Enviar una respuesta JSON
echo json_encode(['success' => true, 'message' => 'Sesión cerrada exitosamente.']);
exit();
?>
