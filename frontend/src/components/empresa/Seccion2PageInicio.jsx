import React, { useState, useEffect } from 'react';
import '../../styles/empresa/miperfilpublicaciones.css';

export const Seccion2PageInicio = ({ empresa, publicaciones, fetchData, manejarMostrarSeccion }) => {
  const [seccionActiva, setSeccionActiva] = useState('ver-publicaciones');
  const [imagenPreview, setImagenPreview] = useState(null);
  const [descripcion, setDescripcion] = useState(""); 
  const [ocultarMeGusta, setOcultarMeGusta] = useState(0); 
  const [sinComentarios, setSinComentarios] = useState(0); 
  const [errorImagen, setErrorImagen] = useState(""); // Para mostrar mensajes de error
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  // Ordenar publicaciones por fecha de la más reciente a la más antigua
  const publicacionesOrdenadas = publicaciones
  ? [...publicaciones].sort((a, b) => new Date(b.Fecha_Publicacion) - new Date(a.Fecha_Publicacion))
  : [];

  const manejarCambioImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
          // Verificar ancho mínimo
          if (img.width < 400) {
            setErrorImagen('La imagen debe tener un ancho mínimo de 500px.');
            return;
          }
          // Si todo está correcto, mostrar la previsualización
          setErrorImagen('');
          setImagenPreview(e.target.result);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const enviarPublicacion = async () => {
    setIsLoading(true);
    if (descripcion && imagenPreview) {
      const formData = new FormData();
      formData.append("empresa_id", empresa.id); 
      formData.append("descripcion", descripcion); 
      formData.append("ocultar_me_gusta", ocultarMeGusta); 
      formData.append("sin_comentarios", sinComentarios); 

      // Convertir imagen base64 a archivo Blob
      const blob = await fetch(imagenPreview).then(res => res.blob());
      formData.append("imagen", new File([blob], "imagen.jpg", { type: blob.type })); // Archivo de imagen

      try {
        // Realiza la solicitud al backend enviando el session_id desencriptado
        const response = await fetch("https://www.codemx.net/codemx/backend/empresa/agregar_publicacion.php", {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setImagenPreview(null);
          setDescripcion("");
          setOcultarMeGusta(0);
          setSinComentarios(0);
          fetchData();
          setSeccionActiva('ver-publicaciones');
          const idPublicacion = result.idPublicacion;
          // Segundo fetch: enviar notificación
          const notifResponse = await fetch(
            'https://www.codemx.net/codemx/backend/config/notificacion_nueva_publicacion.php',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idEmpresa: empresa.id, nombreEmpresa: empresa.nombre, idPublicacion: idPublicacion} ),
            }
          );

          const notifResult = await notifResponse.json();

          if (!notifResponse.ok || !notifResult.success) {
            console.error('Error al enviar notificación:', notifResult.error || 'Respuesta no exitosa');
          }
        } 
      } catch (error) {
        console.log("Error al subir");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="conteiner contenedor-seccion2"> 
      <div className="linea-separadora"></div>
      
      {/* Botones de navegación */}
      <div className="botones-seccion d-flex justify-content-center mb-4">
        <button
          className={`btn me-5 ${seccionActiva === 'ver-publicaciones' ? 'activo' : ''}`}
          onClick={() => setSeccionActiva('ver-publicaciones')}
        >
          <i className="fa-solid fa-th"></i> <span className='texto-boton'>PUBLICACIONES</span>
        </button>
        <button
          className={`btn ${seccionActiva === 'agregar-publicacion' ? 'activo' : ''}`}
          onClick={() => setSeccionActiva('agregar-publicacion')}
        >
          <i className="fa-solid fa-plus-square"></i> <span className='texto-boton'>AGREGAR PUBLICACIÓN</span>
        </button>
      </div>

      {/* Sección de publicaciones */}
      {seccionActiva === "ver-publicaciones" && (
        <>
          {publicacionesOrdenadas && publicacionesOrdenadas.length > 0 ? (
            <div className='contenedor-publicaciones'>
              {publicacionesOrdenadas.map((publicacion, index) => (
                <div key={index} className='item-publicacion' onClick={() => manejarMostrarSeccion(publicacion)}>
                  <img
                    src={`${publicacion.Img}?t=${new Date().getTime()}`}
                    alt={`Foto de la publicación ${index + 1}`}
                    className="img-publicacion"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className='contenedor-sin-publicaciones'>
              <div className='sin-publicaciones d-flex flex-column justify-content-center align-items-center'>
                <i className="fa-solid fa-camera icono-camara mb-2"></i>
                <h2 className="texto-no-publicaciones">Aún no hay publicaciones</h2>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sección para agregar publicación */}
      {seccionActiva === "agregar-publicacion" && (
        <div className='contenedor-agregar-publicaciones d-flex flex-column justify-content-center align-items-center'>
            {/* Input para la imagen */}
            <div className='seccion-inputimg text-center d-flex  flex-column justify-content-center align-items-center'>
              <label htmlFor="upload-image" className="input-label">
                {imagenPreview ? (
                  <img src={imagenPreview} alt="Previsualización" className="img-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <i className="fa-solid fa-image icono-upload"></i>
                    <p>Sube tu imagen aquí</p>
                  </div>
                )}
              </label>
              <input
                id="upload-image"
                type="file"
                className="d-none"
                accept=".jpg, .jpeg, .png"
                onChange={manejarCambioImagen}
              />
              {errorImagen && <p className="text-danger mt-2">{errorImagen}</p>}
            </div>

            {/* Input para la descripción */}
            <div className='seccion-inputdescripcion'>
              <textarea
                placeholder="Escribe una descripción..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            {/* Configuracion de la publicacion */}
            <div className="seccion-configuracion ">
              <h2 className="titulo-configuracion">Configuración avanzada</h2>
              <div className="opcion-configuracion d-flex justify-content-between align-items-center">
                <span>Ocultar recuentos de Me gusta</span>
                <label className="switch">
                <input 
                    type="checkbox" 
                    checked={ocultarMeGusta === 1} 
                    onChange={(e) => setOcultarMeGusta(e.target.checked ? 1 : 0)}/>
                <span className="slider round"></span>
                </label>
              </div>

              <div className="opcion-configuracion d-flex justify-content-between align-items-center">
                <span>Desactivar comentarios</span>
                <label className="switch">
                  <input 
                  type="checkbox"
                  checked={sinComentarios === 1}
                  onChange={(e) => setSinComentarios(e.target.checked ? 1 : 0)} />
                  <span className="slider round"></span>
                </label>
              </div>

            </div>
            {/* Botón para finalizar publicación */}
            <button
              className="btn btn-tipouno mt-2 mb-2 btn-sm "
              disabled={!descripcion || !imagenPreview || isLoading } // Botón deshabilitado si los campos están vacíos
              onClick={() => enviarPublicacion()}
            >
             {isLoading ? 'Cargando...' : 'Finalizar Publicación'}
            </button>
          </div>
        )}
      </div>
    );
};
