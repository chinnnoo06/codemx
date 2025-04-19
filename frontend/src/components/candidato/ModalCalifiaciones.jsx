import React from 'react'

export const ModalCalifiaciones = ({calificaciones}) => {
    console.log(calificaciones)
// Función para renderizar las estrellas
const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(
            <i
                key={i}
                className={`fa fa-star ${i < rating ? 'text-warning' : 'text-muted'}`}
                aria-hidden="true"
            ></i>
        );
    }
    return stars;
};

return (
    <div className="container containr-modal">
        <h5 className="mb-3 text-center titulo-modal">Califiaciones del Candidato</h5>
        {calificaciones && calificaciones.length > 0 ? (
            <div className="calificaciones-list">
                {calificaciones.map((calificacion, index) => (
                    <div key={index} className="calificacion-item mb-3">
                        <div className='header-calificacion d-flex align-items-center'>
                            <img
                                src={calificacion.Logo}
                                alt={calificacion.Nombre}
                                className="usuario-reaccion-foto rounded-circle me-3"
                            />
            
                            <span className="usuario-reaccion-nombre">{calificacion.Nombre}</span>
                        </div>
                        <div className="calificacion-info">
                            <div className="stars">{renderStars(calificacion.Calificacion)}</div>
                            <p>{calificacion.Comentario}</p>
                        </div>


                    </div>
                    
                ))}
            </div>
        ) : (
            <p>No hay calificaciones disponibles.</p>
        )}
    </div>
);
}
