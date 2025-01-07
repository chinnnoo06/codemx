<?php
// verificar_email.php
header('Content-Type: application/json');

// Incluir el archivo de conexión
include 'conexion.php'; // Asegúrate de que este archivo define correctamente $conexion

// Verificar si la conexión está disponible
if (!isset($conexion) || !$conexion) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión con la base de datos']);
    exit;
}

// Obtener el email del POST
$email = $_POST['email'];

if (!$email) {
    echo json_encode(['success' => false, 'error' => 'El email es requerido']);
    exit;
}

// Consultas para verificar en ambas tablas
$queryCandidato = "SELECT COUNT(*) as count FROM candidato WHERE email = ?";
$queryEmpresa = "SELECT COUNT(*) as count FROM empresa WHERE email = ?";

// Preparar la consulta para candidatos
$stmtCandidato = mysqli_prepare($conexion, $queryCandidato);
if (!$stmtCandidato) {
    echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta para candidato']);
    exit;
}
mysqli_stmt_bind_param($stmtCandidato, "s", $email);
mysqli_stmt_execute($stmtCandidato);
$resultCandidato = mysqli_stmt_get_result($stmtCandidato);
$rowCandidato = mysqli_fetch_assoc($resultCandidato);

// Preparar la consulta para empresas
$stmtEmpresa = mysqli_prepare($conexion, $queryEmpresa);
if (!$stmtEmpresa) {
    echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta para empresa']);
    exit;
}
mysqli_stmt_bind_param($stmtEmpresa, "s", $email);
mysqli_stmt_execute($stmtEmpresa);
$resultEmpresa = mysqli_stmt_get_result($stmtEmpresa);
$rowEmpresa = mysqli_fetch_assoc($resultEmpresa);

// Verificar si el correo ya existe en alguna tabla
if ($rowCandidato['count'] > 0 || $rowEmpresa['count'] > 0) {
    echo json_encode(['success' => false, 'error' => 'El correo ya está registrado']);
} else {
    echo json_encode(['success' => true]);
}

// Cerrar los statements
mysqli_stmt_close($stmtCandidato);
mysqli_stmt_close($stmtEmpresa);

// Cerrar la conexión
mysqli_close($conexion);
?>
