import React from 'react'

const Login = ({setIsLogin}) => { // Funcion anónima para recibir la función *setIsLogin* desde App.jsx
  return (
    <div>
        <h1>Login</h1>
        <button onClick={() => setIsLogin(true)}>Iniciar Sesión</button> 
    </div>
  )
}

export default Login
