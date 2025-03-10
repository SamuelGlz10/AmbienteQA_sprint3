import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'

import './css/App.css'

function App() {
  const [isLogin, setIsLogin] = useState(() => {
    // return localStorage.getItem('token') ? true : false;
    return false;
  });

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/" // Ruta default
            element={
              isLogin ? <Navigate to="/home" /> : <Navigate to="/login" />
            } // Protección de rutas
          />
          <Route
            path="/login" // Ruta login
            element={
              isLogin ? <Navigate to="/home" /> : <Login /* Agregar funcion para login fetch, la que está es de prueba */ setIsLogin={setIsLogin} /> // Pasamos setIsLogin como prop
            }
          />
          <Route 
            path="/home" // Ruta home
            element={isLogin ? <Home /> : <Navigate to="/login" />} // Protección de rutas
          /> 
          <Route
            path="*" // Ruta no encontrada
            element={<Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
