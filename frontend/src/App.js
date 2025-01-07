import React from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { RutasBienvenida } from './routers/RutasBienvenida';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PageLogin } from './pages/login-crearcuenta-recuperar/PageLogin';
import { PageRecuperar } from './pages/login-crearcuenta-recuperar/PageRecuperar';
import { PageCrearCuenta } from './pages/login-crearcuenta-recuperar/PageCrearCuenta';

function App() {
   return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<RutasBienvenida />} />
            <Route path="/crear-cuenta" element={<PageCrearCuenta />} />
            <Route path="/iniciar-sesion" element={<PageLogin />} />
            <Route path="/recuperar-password" element={<PageRecuperar />} />
            <Route path="/recuperar-password/:token" element={<PageRecuperar />} />
        </Routes>
    </BrowserRouter>

   )
}

export default App;
 