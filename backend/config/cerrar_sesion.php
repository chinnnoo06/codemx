<?php
session_start();
session_unset();
session_destroy();
echo (['Sesión cerrada exitosamente.']);
exit();
?>
