import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/empresa/vacante.css';
import { ModalTecnologiasRequeridas } from './ModalTecnologiasRequeridas';
import { SeccionTecnologiasRequeridasDominadas } from '../login-crearcuenta-recuperar/SeccionTecnologiasRequeridasDominadas';
import { ModalAdministrarCandidato } from './ModalAdministrarCandidato';
import LoadingSpinner from '../LoadingSpinner';
import jsPDF from 'jspdf';

export const SeccionVacante = ({empresa, vacante, manejarOcultarSeccionVacante, actualizarFetch, setVacanteSeleccionada, empresaActiva}) => {
    const [isScrollExceeded, setIsScrollExceeded] = useState(false);
    const postuladoListRef = useRef(null);
    const [requisitos, setRequisitos] = useState([]);
    const [responsabilidades, setResponsabilidades] = useState([]);
    const [candidatos, setCandidatos] = useState([]);
    const [seccionActiva, setSeccionActiva] = useState("detalle-vacante");
    const [seccionActivaEditar, setSeccionActivaEditar] = useState("form");
    const [showModalOpciones, setShowModalOpciones] = useState(false);
    const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);
    const [showModalTecnologias, setShowModalTecnologias] = useState(false);
    const [showModalAdministrar, setShowModalAdministrar] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true); 
    const [errors, setErrors] = useState({}); 
    const [estados, setEstados] = useState([]);
    const [tecnologias, setTecnologias] = useState([]);
    const [responsabilidadesEditar, setResponsabilidadesEditar] = useState([]);
    const [requerimientos, setRequerimientos] = useState(['']);
    const [tecnologiasRequeridas, setTecnologiasRequeridas] = useState([]);
    const [categorias, setCategorias] = useState({});
    const [tecnologiasRequeridasEditar, setTecnologiasRequeridasEditar] = useState(['']);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        estado: '',
        ubicacion: '',
        fechaLimite: '',
        modalidad: '',
        estatus: '',
    });
    const navigate = useNavigate(); // Hook para redirigir a otra página
    const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null);

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_requisitos_responsabilidades_vacante.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idVacante: vacante.ID }),
            });
    
            if (!Response.ok) {
                const errorData = await Response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }
            const responseData = await Response.json();
    
            // Actualizar estados
            setRequisitos(responseData.requisitos);
            setResponsabilidades(responseData.responsabilidades);
    
            // Inicializar responsabilidadesEditar y requerimientos con los valores de las vacantes
            setResponsabilidadesEditar(responseData.responsabilidades.map(r => r.Responsabilidad));
            setRequerimientos(responseData.requisitos.map(r => r.Requerimiento));
    
            const ResponseCandidatos = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_candidatos_vacante.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idVacante: vacante.ID }),
            });
    
            if (!ResponseCandidatos.ok) {
                const errorDataCandidato = await ResponseCandidatos.json();
                throw new Error(errorDataCandidato.error || 'Error desconocido');
            }
            const responseDataCandidatos = await ResponseCandidatos.json();
    
            setCandidatos(responseDataCandidatos.candidatos);
    
            // Fetch para obtener estados
            const estadosResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_estados.php');
            if (!estadosResponse.ok) {
                throw new Error('Error al obtener los estados');
            }
            const estadosData = await estadosResponse.json();
    
            // Fetch para obtener tecnologías
            const tecnologiasResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_tecnologias.php');
            if (!tecnologiasResponse.ok) {
                throw new Error('Error al obtener las tecnologias');
            }
            const tecnologiasData = await tecnologiasResponse.json();
    
            // Actualizar estados
            setEstados(estadosData);
            setTecnologias(tecnologiasData);
    
            // Asignar valores iniciales al formData
            const estadoVacante = vacante.Estado_Vacante; // Estado en formato nombre
            const estadoID = estadosData.find(estado => estado.nombre === estadoVacante)?.id; // Buscar el ID del estado
    
            const modalidadVacante = vacante.Modalidad_Vacante; // Modalidad de la vacante
            const modalidadID = modalidadVacante === 'Presencial' ? 1 : modalidadVacante === 'Remota' ? 2 : modalidadVacante === 'Híbrido' ? 3 : ''; // Asignar ID de modalidad

            const estatusVacante = vacante.Estatus; 
            const estatusID = estatusVacante === 'activa' ? "activa" : estatusVacante === 'inactiva' ? "inactiva" : ''; 
    
            setFormData({
                titulo: vacante.Titulo,
                descripcion: vacante.Descripcion,
                estado: estadoID || '', // Asignar el ID del estado encontrado
                ubicacion: vacante.Ubicacion,
                fechaLimite: vacante.Fecha_Limite,
                modalidad: modalidadID || '',
                estatus: estatusID || '',// Asigna el ID de modalidad
            });
    
            const ResponseTecnologiasRequeridas = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_tecnologias_vacante.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idVacante: vacante.ID }),
            });
    
            if (!ResponseTecnologiasRequeridas.ok) {
                const errorDataTecnologiasRequeridas = await ResponseTecnologiasRequeridas.json();
                throw new Error(errorDataTecnologiasRequeridas.error || 'Error desconocido');
            }
            const responseDataTecnologiasRequeridas = await ResponseTecnologiasRequeridas.json();
    
            // Actualizar el estado de las tecnologías
            const tecnologiasDataTecnologiasRequeridas = responseDataTecnologiasRequeridas.tecnologias_requeridas;
    
            // Agrupar las tecnologías por categoría
            const categoriasAgrupadas = tecnologiasDataTecnologiasRequeridas.reduce((acc, tecnologia) => {
                const { categoria_tecnologia } = tecnologia;
                if (!acc[categoria_tecnologia]) {
                    acc[categoria_tecnologia] = [];
                }
                acc[categoria_tecnologia].push(tecnologia);
                return acc;
            }, {});
    
            // Actualizamos el estado
            setTecnologiasRequeridas(tecnologiasDataTecnologiasRequeridas);
            setCategorias(categoriasAgrupadas);
    
            // Asignar las tecnologiasRequeridas a tecnologiasRequeridasEditar
            setTecnologiasRequeridasEditar(tecnologiasDataTecnologiasRequeridas.map(t => t.id_tecnologia));
            setIsLoading(false);
    
        } catch (error) {
            console.error('Error al obtener los requisitos y requerimientos de la vacante:', error);
            setIsLoading(false);
        }
    }, [vacante.ID]);

    // Llamamos a fetchData en useEffect
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    

    const checkHeight = () => {
        if (postuladoListRef.current) {
            // Si la altura de la lista supera los 400px, establece el estado
            if (postuladoListRef.current.scrollHeight > 400) {
                setIsScrollExceeded(true);
            } else {
                setIsScrollExceeded(false);
            }
        }
    };

    useEffect(() => {

        checkHeight();

        window.addEventListener('resize', checkHeight);
        
        return () => {
            window.removeEventListener('resize', checkHeight);
        };
    }, [checkHeight]);  

    useEffect(() => {
        if (candidatos.length > 0) {
            checkHeight();
        }
    }, [candidatos, checkHeight]);

    const manejarShowModalOpciones = () => {
        setShowModalOpciones(true);
    };

    const manejarCloseModalOpciones = () => {
        setShowModalOpciones(false);
    };


    const manejarShowModalConfirmacion = () => {
        setShowModalConfirmacion(true);
        setShowModalOpciones(false);
    };

    const manejarCloseModalConfirmacion = () => {
        setShowModalConfirmacion(false);
        setShowModalOpciones(true);
    };

    
    const manejarShowEditarSeccion = () => {
        setSeccionActiva("editar-vacante");
    };

    const manejarCloseEditarSeccion = () => {
        setSeccionActiva("detalle-vacante");
        setShowModalOpciones(false);

        // Desplazar hacia arriba
        window.scrollTo(0, 0);
    };

    const descargarInfo = () => {
        const doc = new jsPDF();
        let y = 25;
    
        const colorTitulo = '#F2A922';     // Amarillo
        const colorTexto = '#0B1C26';      // Azul oscuro

        const agregarFooter = () => {
            const footerY = 285;
            doc.setDrawColor(230);
            doc.line(10, footerY - 5, 200, footerY - 5);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(colorTitulo);
            doc.text('CODEMX - ¡El inicio de tu vida profesional!', 10, footerY);
        };
    
        const separador = () => {
            doc.setDrawColor(230); // gris claro
            doc.setLineWidth(0.2);
            doc.line(10, y, 200, y);
            y += 7;
        };
    
        // === HEADER ===
        doc.setFillColor(colorTexto);
        doc.rect(0, 0, 210, 20, 'F');
    
        // Título izquierda
        doc.setTextColor(colorTitulo);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLE DE LA VACANTE', 10, 13);
    
        // CODEMX derecha
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        const logoBaseX = 175;
        doc.setTextColor('#dde1e9');
        doc.text('CODE', logoBaseX, 13);
        const textWidth = doc.getTextWidth('CODE');
        doc.setTextColor('#F2A922');
        doc.text('MX', logoBaseX + textWidth, 13);
    
        // === DATOS PRINCIPALES ===
        y = 30;
        doc.setTextColor(colorTitulo);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(vacante.Titulo || "Sin título", 10, y);
        y += 10;
    
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorTexto);
        doc.text(`Empresa: ${vacante.Empresa_Nombre}`, 10, y); y += 6;
        doc.text(`Estado: ${vacante.Estado_Vacante}, Ubicación: ${vacante.Ubicacion}`, 10, y); y += 6;
        doc.text(`Modalidad: ${vacante.Modalidad_Vacante}`, 10, y); y += 6;
        doc.text(`Fecha Límite: ${vacante.Fecha_Limite}`, 10, y); y += 6;
        doc.text(`Estatus: ${vacante.Estatus}`, 10, y); y += 8;
        separador();
    
        // === DESCRIPCIÓN ===
        doc.setTextColor(colorTitulo);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("Descripción de la vacante", 10, y); y += 7;
    
        doc.setTextColor(colorTexto);
        doc.setFont('helvetica', 'normal');
        const descripcion = doc.splitTextToSize(vacante.Descripcion || "Sin descripción", 190);
        doc.text(descripcion, 10, y);
        y += descripcion.length * 6;
        separador();
    
        // === RESPONSABILIDADES y REQUISITOS en columnas ===
        const col1X = 10;
        const col2X = 110;
        let y1 = y, y2 = y;
    
        doc.setTextColor(colorTitulo);
        doc.setFont('helvetica', 'bold');
        doc.text("Responsabilidades", col1X, y1); y1 += 7;
        doc.text("Requisitos", col2X, y2); y2 += 7;
    
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorTexto);
    
        responsabilidades.forEach(r => {
            const lines = doc.splitTextToSize(`• ${r.Responsabilidad}`, 90);
            doc.text(lines, col1X, y1);
            y1 += lines.length * 6;
        });
    
        requisitos.forEach(r => {
            const lines = doc.splitTextToSize(`• ${r.Requerimiento}`, 90);
            doc.text(lines, col2X, y2);
            y2 += lines.length * 6;
        });
    
        y = Math.max(y1, y2) + 5;
        separador();
    
        // === TECNOLOGÍAS ===
        doc.setTextColor(colorTitulo);
        doc.setFont('helvetica', 'bold');
        doc.text("Tecnologías Requeridas", 10, y); y += 7;
    
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorTexto);
        tecnologiasRequeridas.forEach(t => {
            doc.text(`• ${t.nombre_tecnologia}`, 10, y); y += 6;
        });
        separador();
    
        // === POSTULADOS ===
        doc.setTextColor(colorTitulo);
        doc.setFont('helvetica', 'bold');
        doc.text(`Postulados (${candidatos.length})`, 10, y); y += 7;
    
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorTexto);
    
        if (candidatos.length === 0) {
            doc.text("No hay candidatos postulados.", 10, y); y += 7;
        } else {
            candidatos.forEach(c => {
                const nombre = `${c.Nombre} ${c.Apellido}`;
                doc.text(`• ${nombre}`, 10, y); y += 6;
    
                if (y > 270) {
                    agregarFooter();
                    doc.addPage();
                    y = 15;
                }
            });
        }
    
        // === GUARDAR ===
        const nombreArchivo = vacante.Titulo ? vacante.Titulo.replace(/\s+/g, '_') : "sin_titulo";
        agregarFooter();
        doc.save(`Vacante_${nombreArchivo}.pdf`);
    };
    
    const eliminarVacante = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/empresa/eliminar_vacante.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idVacante: vacante.ID}),
            });
    
            const result = await response.json();
    
            if (result.success) {
                actualizarFetch(); 
                manejarOcultarSeccionVacante("vacantes");

            } else {
                console.error("Error al eliminar publicacion:", result.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }finally {
            setIsLoading(false);
        }

    };

    // Función para filtrar seguidores
    const buscar = (searchQuery) => {
        setQuery(searchQuery);
    };

    const usuariosFiltrados = candidatos.filter((candidato) =>
        `${candidato.Nombre} ${candidato.Apellido}`.toLowerCase().includes(query.toLowerCase())
    );

    // Función para redirigir al perfil del candidato
    const irAlPerfil = (idCandidato) => {
        navigate(`/usuario-empresa/perfil-candidato`, { 
            state: { idCandidato: idCandidato }
        });
    };

    //EDITAR VACANTE

    const manejarValorInput = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
          });
    };


    const handleResponsabilidadChange = (e, index) => {
        if (Array.isArray(responsabilidadesEditar)) {
            const updated = [...responsabilidadesEditar];
            updated[index] = e.target.value;
            setResponsabilidadesEditar(updated);
        }
    };

    const agregarResponsabilidad = () => {
        if (Array.isArray(responsabilidadesEditar)) {
            setResponsabilidadesEditar([...responsabilidadesEditar, '']);
        }
    };

    const eliminarResponsabilidad = () => {
        if (Array.isArray(responsabilidadesEditar)) {
            setResponsabilidadesEditar(prev => prev.slice(0, -1));
        }
    };


    const handleRequerimientoChange = (e, index) => {
        if (Array.isArray(requerimientos)) {
            const updated = [...requerimientos];
            updated[index] = e.target.value;
            setRequerimientos(updated);
        }
    };

    const agregarRequerimiento = () => {
        if (Array.isArray(requerimientos)) {
            setRequerimientos([...requerimientos, '']);
        }
    };

    const eliminarRequerimiento = () => {
        if (Array.isArray(requerimientos)) {
            setRequerimientos(prev => prev.slice(0, -1));
        }
    };

    const validarCampos = () => {
        const stepErrors = {};

        // Validar inputs y selects del formulario actual
        const form = document.querySelector(`form`);
        if (!form) return false;
        
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach((input) => {
            if (input.hasAttribute('required') && !input.value.trim()) {
            stepErrors[input.id] = 'Este campo es obligatorio';
            }
        });

        // Validar fecha de creación
        const fechaLimite = formData.fechaLimite.trim();
        const today = new Date().toISOString().split('T')[0]; 
        if (fechaLimite && fechaLimite < today) {
        stepErrors['fechaLimite'] = 'La fecha de limite no puede ser menor al día de hoy';
        }

        // Validación de responsabilidades
        responsabilidadesEditar.forEach((resp, index) => {
            if (!resp.trim()) {
                stepErrors[`responsabilidad-${index}`] = 'Este campo es obligatorio';
            }
        });

        // Validación de requerimientos
        requerimientos.forEach((req, index) => {
            if (!req.trim()) {
                stepErrors[`requerimiento-${index}`] = 'Este campo es obligatorio';
            }
        });

        if(tecnologiasRequeridas < 1){
            stepErrors[`tecnologias`] = 'Este campo es obligatorio';
        }

        setErrors(stepErrors);

        return Object.keys(stepErrors).length === 0;
    };

    const editarVacante = async (e) => {
                
        e.preventDefault();
        if (isLoading) return;

        const isValid = validarCampos();

        if (!isValid) {
            setIsLoading(false);
            return; 
        }
    
        setIsLoading(true);


        try {
            const formDataToSend = new FormData();

            Object.keys(formData).forEach((key) => {
                formDataToSend.append(key, formData[key]);
            });

            //Agregar el id de la vacante
            formDataToSend.append('vacante_id', vacante.ID);
            // Agregar responsabilidades y requerimientos como cadenas JSON
            formDataToSend.append('responsabilidades', JSON.stringify(responsabilidadesEditar));
            formDataToSend.append('requerimientos', JSON.stringify(requerimientos));
            //Agregar tecnologias requeridad al formdata para enviar
            const tecnologiasFiltradas = tecnologiasRequeridasEditar.filter(tecnologia => tecnologia.trim() !== '');
            formDataToSend.append('tecnologias', JSON.stringify(tecnologiasFiltradas));
      
            const response = await fetch('https://www.codemx.net/codemx/backend/empresa/editar_vacante_empresa.php', {
              method: 'POST',
              body: formDataToSend,
            });

            if (!response.ok) {
                throw new Error('Error al enviar los datos al servidor');
              }
        
            const result = await response.json();

            if (result.success) {
            // Aquí actualizamos vacanteSeleccionada
                setVacanteSeleccionada({
                    ...vacante,
                    Titulo: formData.titulo,
                    Descripcion: formData.descripcion,
                    Estado_Vacante: estados.find(estado => estado.id === formData.estado)?.nombre || '',
                    Ubicacion: formData.ubicacion,
                    Fecha_Limite: formData.fechaLimite,
                    Modalidad_Vacante: formData.modalidad === '1' ? 'Presencial' : formData.modalidad === '2' ? 'Remota' : 'Híbrido',
                    Estatus: formData.estatus,
                    Tecnologias: tecnologiasFiltradas,
                });

                setSeccionActiva("detalle-vacante");
                setSeccionActivaEditar("form");
                manejarCloseModalOpciones();
                fetchData();
                actualizarFetch();
                window.scrollTo(0, 0);
            } else {
                alert(result.error || 'Hubo un error al actualizar.');
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const manejarCambioTecnologias = (seleccionadas) => {
        setTecnologiasRequeridasEditar(seleccionadas);
        setSeccionActivaEditar("form"); 
        window.scrollTo(0, 0);
    };

    const manejarShowAgregarTecnologias = () => {
        setSeccionActivaEditar("seleccionar-tecnologias");
        window.scrollTo(0, 0);
    };

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

    return (
        <div> 

            {seccionActiva == "detalle-vacante" && (
                <>
                    <div className='boton d-flex align-items-center '>
                        <button className="btn-volver-vacantes d-flex align-items-center" onClick={() => manejarOcultarSeccionVacante()}>
                            <i className="fa-solid fa-arrow-left me-2"></i> Volver a vacantes
                        </button>
                    </div>
                    <div className='vacante-detalle d-flex flex-column pt-3 pb-3'>
                        <div className='informacion-principal d-flex align-items-center mb-4'>
                
                            <div className='fila-info-vacante w-100'>
                                <div className='d-flex justify-content-between align-items-start'>
                                    <h3 className='titulo-vacante'>{vacante.Titulo}</h3>
                                    {empresaActiva === empresa.id && (
                                        <div className="boton-opciones-vacante" onClick={manejarShowModalOpciones}>
                                            <i className="fa-solid fa-ellipsis ms-auto"></i>
                                        </div>
                                    )}
                                </div>
                                
                                <h5 className='nombre-empresa'>{vacante.Empresa_Nombre}</h5>

                                <div className='datos-vacante d-flex'>
                                    <span className='estado-vacante text-muted'>{vacante.Estado_Vacante}, México</span>
                                    <span className='direccion-vacante text-muted'>{vacante.Ubicacion}</span>
                                    <span className='modalidad-vacante text-muted'>({vacante.Modalidad_Vacante})</span>

                                </div>

                                <div className="datos2-vacante mt-2 d-flex gap-3">
                                    <div className='tecnologias-requeridas'  onClick={() => setShowModalTecnologias(true)}>
                                        <i className="fa-solid fa-list-check me-2"></i>
                                        <span>Tecnologías requeridas</span>
                                    </div>
                                    <span className='fechaLimite-vacante text-muted'>Fecha Limite: {vacante.Fecha_Limite}</span>
                                    {vacante.Estatus === "activa" && (<span className='estatus-vacante text-muted'>Activa</span>)}
                                    {vacante.Estatus === "inactiva" && (<span className='estatus-vacante text-muted'>Inactiva</span>)}

                                </div>
                            </div>
                        </div>

                        <div className='informacion-detallada'>
                            <div className='descripcion-vacante mb-4'>
                                <h5 className='subtitulo'>Descripción de la vacante</h5>
                                <span className='text-muted'>{vacante.Descripcion}</span>
                            </div>

                            <div className='row'>
                                <div className='requisitos col-md-6 mb-4'>
                                    <h5 className='subtitulo'>Responsabilidades de la vacante</h5>
                                    <ul className="text-muted">
                                        {responsabilidades.map((responsabilidad, index) => (
                                            <li key={index}>{responsabilidad.Responsabilidad}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className='responsabilidades col-md-6 mb-4'>
                                    <h5 className='subtitulo'>Requisitos de la vacante</h5>
                                    <ul className="text-muted">
                                        {requisitos.map((requisito, index) => (
                                            <li key={index}>{requisito.Requerimiento}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className='postulados-vacante mb-4'>
                                <h5 className='subtitulo mb-3'><i className="fa-solid fa-users me-2"></i> {vacante.Cantidad_Postulados} Postulados</h5>
                                {/* Barra de búsqueda */}
                                <div className="input-group mb-4 position-relative">
                                <span className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
                                    <i className="fa fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    name="query"
                                    placeholder="Buscar Usuario"
                                    className="form-control rounded input-busqueda"
                                    value={query}
                                    onChange={(e) => buscar(e.target.value)}
                                />
                                </div>
                        
                                {/* Lista de seguidores */}
                                <div className="usuario-postulado-list" ref={postuladoListRef}>
                                    {usuariosFiltrados && usuariosFiltrados.length > 0 ? (
                                        usuariosFiltrados.map((candidato) => {
                                            const nombreCompleto = `${candidato.Nombre} ${candidato.Apellido}`;
                                            return (
                                                <div
                                                    key={candidato.ID}
                                                    onClick={() => irAlPerfil(candidato.ID)}
                                                    className="usuario-postulado-item d-flex align-items-center mb-3"
                                                >
                                                    <img
                                                        src={candidato.Fotografia}
                                                        alt={candidato.Nombre}
                                                        className="usuario-postulado-foto rounded-circle me-3"
                                                    />
                                                    <span className="usuario-postulado-nombre">{nombreCompleto}</span>
                                                    {empresaActiva === empresa.id && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCandidatoSeleccionado(candidato);
                                                                setShowModalAdministrar(true);
                                                            }}
                                                            className={`btn btn-administrar-candidato ms-auto ${isScrollExceeded ? 'add-margin' : ''}`}
                                                        >
                                                            Administrar
                                                        </button>
                                                    )}
                                 
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p>La vacante no tiene postulados</p>
                                    )}
                                </div>
                            </div>

                
                        </div>
                    </div>

                    {/*Modal opciones*/}
                    {showModalOpciones && (
                        <div className="modal-overlay-opciones" onClick={() => manejarCloseModalOpciones()}>
                            <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                                <div className="botones d-flex flex-column align-items-center">
                
                                    <button className="btn-opciones btn-eliminar" onClick={() => manejarShowModalConfirmacion()}>
                                        Eliminar
                                    </button>
                                    <div className="divider"></div> 
                                    <button className="btn-opciones" onClick={() => manejarShowEditarSeccion()}>
                                        Editar
                                    </button>
                                    <div className="divider"></div> 
                                    <button className="btn-opciones" onClick={() => descargarInfo()}>
                                        Descargar Información
                                    </button>
                                    <div className="divider"></div> 
                                    <button className="btn-opciones" onClick={() => manejarCloseModalOpciones()}>
                                        Cancelar
                                    </button>
                            
                
                                </div>
                            </div>
                        </div>
                    )}

                    {/*Modal Confirmacion*/}
                    {showModalConfirmacion && (
                        <div className="modal-overlay-confirmacion" onClick={() => manejarCloseModalConfirmacion()}>
                            <div className="modal-content-confirmacion" onClick={(e) => e.stopPropagation()}>
                    
                                <p>¿Seguro que quieres eliminar la vacante?</p>

                                <div className="d-flex justify-content-between mt-3">
                                <button
                                    className="btn btn-tipodos btn-sm"
                                    onClick={() => manejarCloseModalConfirmacion()}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                onClick={() => eliminarVacante()}
                                >
                                        {isLoading ? 'Cargando...' : 'Confirmar'}
                                </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/*Modal Confirmacion*/}
                    {showModalTecnologias && (
                        <div className="modal-overlay" onClick={() => setShowModalTecnologias(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="close-button btn" onClick={() => setShowModalTecnologias(false)}>
                                        <i className="fa-solid fa-x"></i>
                                </button>
                                <ModalTecnologiasRequeridas categorias={categorias}></ModalTecnologiasRequeridas>
                            </div>
                        </div>
                    )}

                    {/*Modal Admin*/}
                    {showModalAdministrar && (
                        <div className="modal-overlay" onClick={() => setShowModalAdministrar(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="close-button btn" onClick={() => setShowModalAdministrar(false)}>
                                        <i className="fa-solid fa-x"></i>
                                </button>
                                <ModalAdministrarCandidato candidato={candidatoSeleccionado} tecnologiasRequeridas={tecnologiasRequeridas} idVacante={vacante.ID} idEmpresa={empresa.id} setShowModalAdministrar={setShowModalAdministrar} fetchDataVacante={fetchData} actualizarFetch={actualizarFetch} vacante={vacante} setVacanteSeleccionada={setVacanteSeleccionada} nombreEmpresa={empresa.nombre}></ModalAdministrarCandidato>
                            </div>
                        </div>
                    )}


                </>
            )} 

            {seccionActiva == "editar-vacante" && (
                <>
                    {seccionActivaEditar == "form" && (
                        <>
                            <form className="form " onSubmit={editarVacante} noValidate>
                            <div className='header-agregar-vacante d-flex align-items-center mb-3'>

                                <h2 className="mx-auto text-center titulo-header">Editar Vacante</h2>
                            </div>
                            

                            <div className="mb-4">
                                <label htmlFor="titulo" className="form-label">Título de la Vacante <span className="text-danger">*</span></label>
                                <input type="text" id="titulo" name="titulo" className="form-control" maxLength={50} value={formData.titulo} onChange={manejarValorInput} required/>
                                {errors.titulo && <small className="text-danger">{errors.titulo}</small>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="descripcion" className="form-label">Descripción <span className="text-danger">*</span></label>
                                <textarea id="descripcion" name="descripcion" className="form-control" maxLength={400}  value={formData.descripcion} onChange={manejarValorInput}required></textarea>
                                {errors.descripcion && <small className="text-danger">{errors.descripcion}</small>}
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <label className="form-label">Responsabilidades <span className="text-danger">*</span></label>
                                    {responsabilidadesEditar.map((resp, index) => (
                                        <div key={index} className="mb-2">
                                        <input 
                                            type="text" 
                                            name={`responsabilidad-${index}`} 
                                            className="form-control" 
                                            maxLength={150} 
                                            value={resp} 
                                            onChange={(e) => handleResponsabilidadChange(e, index)} 
                                            required
                                        />
                                        {errors[`responsabilidad-${index}`] && <small className="text-danger">{errors[`responsabilidad-${index}`]}</small>}
                                        </div>
                                    ))}
                                    <div className='botones-requerimientos-responsabilidades d-flex justify-content-between '>
                                        <button type="button" className="btn-sumar-restar" onClick={agregarResponsabilidad}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                        {responsabilidadesEditar.length > 1 &&(
                                            <button type="button" className="btn-sumar-restar"  onClick={() => eliminarResponsabilidad()}>
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        )}

                                    </div>
                                </div>

                                <div className="col-md-6 mb-4">
                                    <label className="form-label">Requerimientos <span className="text-danger">*</span></label>
                                    {requerimientos.map((req, index) => (
                                        <div key={index} className="mb-2">
                                        <input 
                                            type="text" 
                                            name={`requerimiento-${index}`} 
                                            className="form-control" 
                                            maxLength={150} 
                                            value={req} 
                                            onChange={(e) => handleRequerimientoChange(e, index)} 
                                            required
                                        />
                                        {errors[`requerimiento-${index}`] && <small className="text-danger">{errors[`requerimiento-${index}`]}</small>}
                                        </div>
                                    ))}
                                    <div className='botones-requerimientos-responsabilidades d-flex justify-content-between '>
                                        <button type="button" className="btn-sumar-restar" onClick={agregarRequerimiento}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                        {requerimientos.length > 1 && (
                                            <button type="button" className="btn-sumar-restar" onClick={eliminarRequerimiento}>
                                                <i className="fas fa-minus"></i>
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <label htmlFor="estado" className="form-label">Estado <span className="text-danger">*</span></label>
                                    <select id="estado" name="estado" className="form-select custom-font-select"  value={formData.estado} onChange={manejarValorInput} required>
                                        <option value="">Seleccione un estado</option>
                                        {estados.map((estado) => (
                                            <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.estado && <small className="text-danger">{errors.estado}</small>}
                                </div>
                                <div className="col-md-6 mb-4">
                                    <label htmlFor="ubicacion" className="form-label">Ubicación <span className="text-danger">*</span></label>
                                    <input type="text" id="ubicacion" name="ubicacion" className="form-control" maxLength={70}  value={formData.ubicacion} onChange={manejarValorInput} required/>
                                    {errors.ubicacion && <small className="text-danger">{errors.ubicacion}</small>}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <label htmlFor="fechaLimite" className="form-label">Fecha Límite <span className="text-danger">*</span></label>
                                    <input type="date" id="fechaLimite" name="fechaLimite" className="form-control"  value={formData.fechaLimite} onChange={manejarValorInput} required/>
                                    {errors.fechaLimite && <small className="text-danger">{errors.fechaLimite}</small>}
                                </div>
                                <div className="col-md-6 mb-4">
                                    <label htmlFor="fechaLimite" className="form-label">Modalidad <span className="text-danger">*</span></label>
                                    <select id="modalidad" name="modalidad" className="form-select custom-font-select"  value={formData.modalidad} onChange={manejarValorInput} required>
                                        <option value="">Seleccione una modalidad</option>
                                        <option value="1">Presencial</option>
                                        <option value="2">Remota</option>
                                        <option value="3">Híbrido</option>
                                    </select>
                                    {errors.modalidad && <small className="text-danger">{errors.modalidad}</small>}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="estatus" className="form-label">Estatus <span className="text-danger">*</span></label>
                                <select id="estatus" name="estatus" className="form-select custom-font-select" value={formData.estatus} onChange={manejarValorInput} required>
                                    <option value="">Seleccione el estatus</option>
                                    <option value="activa">Activa</option>
                                    <option value="inactiva">Inactiva</option>
                                </select>
                                {errors.estatus && <small className="text-danger">{errors.estatus}</small>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="tecnologias" className="form-label">Tecnologías Requeridas <span className="text-danger">*</span></label>
                                
                                {tecnologiasRequeridasEditar.length > 1 ? (
                                    <div className='mostrar-tecnologias p-3'>
                                        <div className="d-flex flex-wrap gap-2">
                                            {tecnologiasRequeridasEditar.map((id) => {
                                                const tecnologia = tecnologias.find(t => t.id === id);
                                                return tecnologia ? (
                                                    <button key={id} className="btn-tecnologia">{tecnologia.tecnologia}</button>
                                                ) : null;
                                            })}
                                        </div>
                                        <button type="button" className="btn btn-tipodos  mt-2" onClick={manejarShowAgregarTecnologias}>
                                            Editar tecnologías
                                        </button>
                                    </div>
                                ) : (
                                    <div className='mostrar-tecnologias p-3 text-center'>
                                        <span onClick={manejarShowAgregarTecnologias}>
                                            Agregar tecnologías
                                        </span>
                                    </div>
                                )}
                                {errors.tecnologias && <small className="text-danger">{errors.tecnologias}</small>}
                            </div>

                            <div className="d-flex justify-content-between mb-4">
                                <button className="btn btn-cancelar-vacante" onClick={manejarCloseEditarSeccion}>Cancelar</button>
                                <button type="submit" className="btn btn-publicar-vacante">
                                    {isLoading ? 'Cargando...' : 'Editar Vacante'}
                                </button>
                            </div>
                        </form>
                        </>
                    )}
                    {seccionActivaEditar == "seleccionar-tecnologias" && (
                        <>
                            <form className="form" data-step="3">
                                <SeccionTecnologiasRequeridasDominadas
                                    tecnologias={tecnologias}
                                    seleccionadas={tecnologiasRequeridasEditar}
                                    onSeleccionChange={manejarCambioTecnologias}
                                    tecnologiasVacante={1}
                                    esperarConfirmacion = {true} 
                                    /> 
                            </form>
                        </>
                    )}
             
                </>
            )}
        
        </div>
      
    );
};
