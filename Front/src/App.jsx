import { useState } from 'react'
import { BrowserRouter, Route, Router } from 'react-router-dom'
import './css/App.css'

function App() {
  const [isLogin, setIsLogin] = useState(() => {
    return localStorage.getItem('isLogin') === 'true' ? useState(true) : useState(false);
  });

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" // Ruta default
            element={isLogin ? <Navigate to='/home' /> : <Navigate to='/login'/>} // Protección de rutas
          />
          <Route path="/login" // Ruta login
            element={isLogin ? <Navigate to='/home' /> : <Login /* Agregar funcion para login fetch */ />}
          />
          <Route path="/home" // Ruta home
            element={isLogin ? <Home /> : <Navigate to='/login' />} // Protección de rutas
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
