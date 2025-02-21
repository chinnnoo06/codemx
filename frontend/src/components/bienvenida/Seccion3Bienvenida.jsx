import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

export const Seccion3Bienvenida = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0); // Clave para reiniciar la animación
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          setKey((prevKey) => prevKey + 1); // Cambia la clave para reiniciar CountUp
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.5 } // Se activa cuando el 50% de la sección es visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="estadisticas py-7 contenedor-limitado">
      <div className="container text-center">
        <h2 className="display-3 fw-bold mb-5">Nuestros Logros</h2>
        <div className="row">
          <div className="col-md-4">
            <h3 className="fw-bold display-5">
              +<CountUp key={key} start={0} end={10000} duration={2} separator="," />
            </h3>
            <p>Usuarios Registrados</p>
          </div>
          <div className="col-md-4">
            <h3 className="fw-bold display-5">
              +<CountUp key={key} start={0} end={500} duration={2} separator="," />
            </h3>
            <p>Empresas Colaboradoras</p>
          </div>
          <div className="col-md-4">
            <h3 className="fw-bold display-5">
              +<CountUp key={key} start={0} end={2000} duration={2} separator="," />
            </h3>
            <p>Ofertas de Trabajo</p>
          </div>
        </div>
      </div>
    </section>
  );
};
