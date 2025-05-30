import React from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { RutasBienvenida } from './routers/RutasBienvenida';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PageLogin } from './pages/login-crearcuenta-recuperar/PageLogin';
import { PageRecuperar } from './pages/login-crearcuenta-recuperar/PageRecuperar';
import { PageCrearCuenta } from './pages/login-crearcuenta-recuperar/PageCrearCuenta';
import { RutasCandidato } from './routers/RutasCandidato';
import { RutasEmpresa } from './routers/RutasEmpresa';
import { PageFaltaVerificarCorreo } from './pages/PageFaltaVerificarCorreo';
import { PageFaltaVerificarRFC } from './pages/PageFaltaVerificarRFC';
import { RutasAdmin } from './routers/RutasAdmin';

function App() {
   return (

    <BrowserRouter basename="/codemx/frontend/build">
        <Routes>
            <Route path="/" element={<RutasBienvenida />} />
            <Route path="/bienvenida" element={<RutasBienvenida />} />
            <Route path="/crear-cuenta" element={<PageCrearCuenta />} />
            <Route path="/iniciar-sesion" element={<PageLogin />} />
            <Route path="/recuperar-password" element={<PageRecuperar />} />
            <Route path="/recuperar-password/:token" element={<PageRecuperar />} />
            <Route path="/usuario-candidato/*" element={<RutasCandidato />} />
            <Route path="/usuario-empresa/*" element={<RutasEmpresa />} />
            <Route path="/usuario-administrador/*" element={<RutasAdmin />} />
            <Route path="/falta-verificar-correo/" element={<PageFaltaVerificarCorreo />} />
            <Route path="/falta-verificar-rfc/" element={<PageFaltaVerificarRFC />} />
        </Routes>
    </BrowserRouter>

   )
}

export default App;