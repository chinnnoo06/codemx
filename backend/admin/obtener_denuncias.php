<?php
require_once '../config/conexion.php';

$allowed_origin = 'https://www.codemx.net';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Consulta para denuncias de Candidato a Candidato
    $consultaDenunciaCandidatoCandidato = "
    SELECT 
        denuncia_candidato_candidato.ID,
        denuncia_candidato_candidato.Denunciante_ID,
        denuncia_candidato_candidato.Denunciado_ID,
        motivos_denuncia_candidato.Motivo,
        estado_denuncia.Estado,
        denuncia_candidato_candidato.Descripcion,
        denuncia_candidato_candidato.Fecha_Denuncia,
        denuncia_candidato_candidato.Comentario_ID,
        comentarios.Comentario,
        comentarios.Fecha_Comentario,
        candidato_denunciante.Nombre AS Nombre_Denunciante,
        candidato_denunciante.Apellido AS Apellido_Denunciante,
        candidato_denunciante.Fotografia AS Foto_Denunciante,
        candidato_denunciado.Nombre AS Nombre_Denunciado,
        candidato_denunciado.Apellido AS Apellido_Denunciado,
        candidato_denunciado.Fotografia AS Foto_Denunciado,
        'Candidato a Candidato' AS Tipo_Denuncia
    FROM denuncia_candidato_candidato
    INNER JOIN motivos_denuncia_candidato ON denuncia_candidato_candidato.Motivo = motivos_denuncia_candidato.ID
    INNER JOIN estado_denuncia ON denuncia_candidato_candidato.Estado_Denuncia = estado_denuncia.ID
    INNER JOIN candidato AS candidato_denunciante ON denuncia_candidato_candidato.Denunciante_ID = candidato_denunciante.ID
    INNER JOIN candidato AS candidato_denunciado ON denuncia_candidato_candidato.Denunciado_ID = candidato_denunciado.ID
    LEFT JOIN comentarios ON denuncia_candidato_candidato.Comentario_ID = comentarios.ID
    ";

    // Consulta para denuncias de Candidato a Empresa
    $consultaDenunciaCandidatoEmpresa = "
    SELECT 
        denuncia_candidato_empresa.ID,
        denuncia_candidato_empresa.Denunciante_ID,
        denuncia_candidato_empresa.Denunciado_ID,
        motivos_denuncia_empresa.Motivo,
        estado_denuncia.Estado,
        denuncia_candidato_empresa.Descripcion,
        denuncia_candidato_empresa.Fecha_Denuncia,
        denuncia_candidato_empresa.Comentario_ID,
        comentarios.Comentario,
        comentarios.Fecha_Comentario,
        denuncia_candidato_empresa.Mensaje_ID,
        mensajes.Mensaje,
        mensajes.Fecha_Envio,
        denuncia_candidato_empresa.Publicacion_ID,
        denuncia_candidato_empresa.Vacante_ID,
        candidato_denunciante.Nombre AS Nombre_Denunciante,
        candidato_denunciante.Apellido AS Apellido_Denunciante,
        candidato_denunciante.Fotografia AS Foto_Denunciante,
        empresa_denunciado.Nombre AS Nombre_Denunciado,
        empresa_denunciado.Logo AS Foto_Denunciado,
        'Candidato a Empresa' AS Tipo_Denuncia
    FROM denuncia_candidato_empresa
    INNER JOIN motivos_denuncia_empresa ON denuncia_candidato_empresa.Motivo = motivos_denuncia_empresa.ID
    INNER JOIN estado_denuncia ON denuncia_candidato_empresa.Estado_Denuncia = estado_denuncia.ID
    INNER JOIN candidato AS candidato_denunciante ON denuncia_candidato_empresa.Denunciante_ID = candidato_denunciante.ID
    INNER JOIN empresa AS empresa_denunciado ON denuncia_candidato_empresa.Denunciado_ID = empresa_denunciado.ID
    LEFT JOIN comentarios ON denuncia_candidato_empresa.Comentario_ID = comentarios.ID
    LEFT JOIN mensajes ON denuncia_candidato_empresa.Mensaje_ID = mensajes.ID
    ";

    // Consulta para denuncias de Empresa a Candidato
    $consultaDenunciaEmpresaCandidato = "
    SELECT 
        denuncia_empresa_candidato.ID,
        denuncia_empresa_candidato.Denunciante_ID,
        denuncia_empresa_candidato.Denunciado_ID,
        motivos_denuncia_candidato.Motivo,
        estado_denuncia.Estado,
        denuncia_empresa_candidato.Descripcion,
        denuncia_empresa_candidato.Fecha_Denuncia,
        denuncia_empresa_candidato.Comentario_ID,
        comentarios.Comentario,
        comentarios.Fecha_Comentario,
        denuncia_empresa_candidato.Mensaje_ID,
        mensajes.Mensaje,
        mensajes.Fecha_Envio,
        empresa_denunciante.Nombre AS Nombre_Denunciante,
        empresa_denunciante.Logo AS Foto_Denunciante,
        candidato_denunciado.Nombre AS Nombre_Denunciado,
        candidato_denunciado.Apellido AS Apellido_Denunciado,
        candidato_denunciado.Fotografia AS Foto_Denunciado,
        'Empresa a Candidato' AS Tipo_Denuncia
    FROM denuncia_empresa_candidato
    INNER JOIN motivos_denuncia_candidato ON denuncia_empresa_candidato.Motivo = motivos_denuncia_candidato.ID
    INNER JOIN estado_denuncia ON denuncia_empresa_candidato.Estado_Denuncia = estado_denuncia.ID
    INNER JOIN empresa AS empresa_denunciante ON denuncia_empresa_candidato.Denunciante_ID = empresa_denunciante.ID
    INNER JOIN candidato AS candidato_denunciado ON denuncia_empresa_candidato.Denunciado_ID = candidato_denunciado.ID
    LEFT JOIN comentarios ON denuncia_empresa_candidato.Comentario_ID = comentarios.ID
    LEFT JOIN mensajes ON denuncia_empresa_candidato.Mensaje_ID = mensajes.ID
    ";

    // Ejecutar todas las consultas
    $resultCandidatoCandidato = mysqli_query($conexion, $consultaDenunciaCandidatoCandidato);
    $resultCandidatoEmpresa = mysqli_query($conexion, $consultaDenunciaCandidatoEmpresa);
    $resultEmpresaCandidato = mysqli_query($conexion, $consultaDenunciaEmpresaCandidato);

    if ($resultCandidatoCandidato === false || $resultCandidatoEmpresa === false || $resultEmpresaCandidato === false) {
        // Si hay error en alguna consulta, enviar un error con mensaje
        echo json_encode(['error' => 'Error en la consulta SQL', 'details' => mysqli_error($conexion)]);
        exit();
    }

    $denuncias = [];

    // Agregar los resultados de cada consulta en el array
    while ($fila = mysqli_fetch_assoc($resultCandidatoCandidato)) {
        $denuncias[] = $fila;
    }
    while ($fila = mysqli_fetch_assoc($resultCandidatoEmpresa)) {
        $denuncias[] = $fila;
    }
    while ($fila = mysqli_fetch_assoc($resultEmpresaCandidato)) {
        $denuncias[] = $fila;
    }

    // Ordenar el array de denuncias por Fecha_Denuncia
    usort($denuncias, function($a, $b) {
        return strtotime($b['Fecha_Denuncia']) - strtotime($a['Fecha_Denuncia']);
    });

    if (empty($denuncias)) {
        // Si no hay resultados, enviar mensaje adecuado
        echo json_encode(['error' => 'No se encontraron denuncias']);
        exit();
    }

    // Consulta para solicitudes de revision de calificaciones
    $consultaSolicitudes = "
    SELECT 
        validar_calificaciones.ID,
        validar_calificaciones.Calificacion_ID,
        validar_calificaciones.Motivo,
        validar_calificaciones.Fecha_Creacion,
        calificaciones_candidato.Candidato_ID,
        calificaciones_candidato.Empresa_ID,
        calificaciones_candidato.Calificacion,
        calificaciones_candidato.Comentario,
        calificaciones_candidato.Fecha_Calificacion,
        candidato.Nombre AS Candidato_Nombre,
        candidato.Apellido AS Candidato_Apellido,
        candidato.Fotografia AS Candidato_Foto,
        empresa.Nombre AS Empresa_Nombre,
        empresa.Logo AS Empresa_Foto
    FROM validar_calificaciones
    INNER JOIN calificaciones_candidato ON validar_calificaciones.Calificacion_ID = calificaciones_candidato.ID
    INNER JOIN candidato ON candidato.ID = calificaciones_candidato.Candidato_ID
    INNER JOIN empresa ON empresa.ID = calificaciones_candidato.Empresa_ID
    ORDER BY validar_calificaciones.Fecha_Creacion;
    ";

    $resultSolicitudes = mysqli_query($conexion, $consultaSolicitudes);

    if ($resultSolicitudes === false) {
        // Si hay error en alguna consulta, enviar un error con mensaje
        echo json_encode(['error' => 'Error en la consulta SQL', 'details' => mysqli_error($conexion)]);
        exit();
    }

    $solicitudes = [];

    // Agregar los resultados de cada consulta en el array
    while ($fila = mysqli_fetch_assoc($resultSolicitudes)) {
        $solicitudes[] = $fila;
    }

    echo json_encode([
        'success' => true,
        'denuncias' => $denuncias,
        'solicitudes' => $solicitudes
    ]);
    exit();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'El método no está permitido.']);
    exit();
}
?>
