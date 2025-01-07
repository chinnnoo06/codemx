import React from 'react'

export const Seccion3Bienvenida = () => {
  return (
    <section className="estadisticas py-7 contenedor-limitado">
        <div className="container text-center">
            <h2 className="display-3 fw-bold mb-5">Nuestros Logros</h2>
            <div className="row">
            <div className="col-md-4">
                <h3 className="fw-bold display-5">+10,000</h3>
                <p>Usuarios Registrados</p>
            </div>
            <div className="col-md-4">
                <h3 className="fw-bold display-5">+500</h3>
                <p>Empresas Colaboradoras</p>
            </div>
            <div className="col-md-4">
                <h3 className="fw-bold display-5">+2,000</h3>
                <p>Ofertas de Trabajo</p>
            </div>
            </div>
        </div>
    </section>

  )
}
