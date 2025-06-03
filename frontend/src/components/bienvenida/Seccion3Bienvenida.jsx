import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

export const Seccion3Bienvenida = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0); // Clave para reiniciar la animación
  const sectionRef = useRef(null);
  const [usuarios, setUsuarios] = useState(0);
  const [empresas, setEmpresas] = useState(0);
  const [vacantes, setVacantes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Realiza la solicitud al backend enviando el session_id desencriptado
            const response = await fetch("https://www.codemx.net/codemx/backend/config/obtener_datos_bienvenida.php", {
                method: "POST",
            });

            const result = await response.json();

            if (result.success) {
                // Actualiza el estado con los datos recibidos
                setUsuarios(result.numUsuarios);
                setEmpresas(result.numEmpresas);
                setVacantes(result.numVacantes);
            } else if (result.error) {
                console.log("Error al obtener estadísticas");
            }
        } catch (error) {
            console.error("Error al obtener los datos del candidato:", error);
        }
    };

    fetchData();
    }, []);

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
              +<CountUp key={key} start={0} end={usuarios} duration={2} separator="," />
            </h3>
            <p>Usuarios Registrados</p>
          </div>
          <div className="col-md-4">
            <h3 className="fw-bold display-5">
              +<CountUp key={key} start={0} end={empresas} duration={2} separator="," />
            </h3>
            <p>Empresas Colaboradoras</p>
          </div>
          <div className="col-md-4">
            <h3 className="fw-bold display-5">
              +<CountUp key={key} start={0} end={vacantes} duration={2} separator="," />
            </h3>
            <p>Ofertas de Trabajo</p>
          </div>
        </div>
      </div>
    </section>
  );
};
