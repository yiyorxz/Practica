import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contrasena: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.contrasena || !formData.confirmPassword) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    if (!formData.email.endsWith('@uct.cl')) {
      setError('Debe usar un correo institucional (@uct.cl)');
      return false;
    }

    if (formData.contrasena !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/registro/secretaria', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        contrasena: formData.contrasena
      });

      if (response.data.status === 'success') {
        localStorage.setItem('userData', JSON.stringify(response.data.secretaria));
        alert('Registro exitoso!');
        navigate('/');
      } else {
        setError(response.data.error || 'Error al registrar. Por favor, intente nuevamente.');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center font-roboto"
      style={{ backgroundImage: "url('/img/uct.png')" }}
    >
      <div className="bg-sky-400 rounded-3xl p-8 w-96 shadow-xl">
        <div className="text-center">
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/img/Logo_ing_civil_informatica.png"
              alt="UCT Logo"
              className="w-30"
            />
          </div>
        </div>
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form className="mt-8" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="nombre" className="block text-black text-base mb-2">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Ingrese su nombre"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="apellido" className="block text-black text-base mb-2">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Ingrese su apellido"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="block text-black text-base mb-2">
              Correo institucional
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="example@uct.cl"
            />
          </div>
          <div className="mb-8">
            <label htmlFor="contrasena" className="block text-black text-base mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="contrasena"
              value={formData.contrasena}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="***********"
            />
          </div>
          <div className="mb-8">
            <label htmlFor="confirmPassword" className="block text-black text-base mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="***********"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-3 py-3 bg-blue-600 text-white font-medium rounded-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            } transition`}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;