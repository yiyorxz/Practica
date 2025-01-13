import React, { useState, useEffect } from 'react';
import Navbar from "../components/navbar";
import Swal from 'sweetalert2';
import axiosInstance from '../config/axiosConfig';

const AdminProfesores = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      fetchProfesores();
    }, []);
  
    const fetchProfesores = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Token actual:', token);
        const response = await axiosInstance.get('/profesores');
        console.log('Respuesta completa:', response);
        if (response.data.status === 'success') {
          setProfesores(response.data.data);
        }
      } catch (err) {
        console.log('Error completo:', err.response || err);
        setError('Error al cargar los profesores');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
  
    const handleAddProfesor = async () => {
      const { value: formValues } = await Swal.fire({
        title: 'Agregar nuevo profesor',
        html: `
          <input id="nombre" class="swal2-input" placeholder="Nombre">
          <input id="apellido" class="swal2-input" placeholder="Apellido">
          <input id="email" class="swal2-input" placeholder="Correo electrónico">
        `,
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar',
        preConfirm: () => {
          const nombre = document.getElementById('nombre').value;
          const apellido = document.getElementById('apellido').value;
          const email = document.getElementById('email').value;
          
          if (!nombre || !apellido || !email) {
            Swal.showValidationMessage('Por favor complete todos los campos');
            return false;
          }
          
          if (!email.includes('@')) {
            Swal.showValidationMessage('Por favor ingrese un correo electrónico válido');
            return false;
          }
          
          return { nombre, apellido, email };
        }
      });
  
      if (formValues) {
        try {
          const response = await axiosInstance.post('/profesores', formValues);
          
          if (response.data.status === 'success') {
            await Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Profesor agregado correctamente',
            });
            fetchProfesores();
          }
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Error al agregar el profesor';
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
          });
        }
      }
    };

    const handleEditProfesor = async (profesor) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Profesor',
            html: `
                <input id="nombre" class="swal2-input" placeholder="Nombre" value="${profesor.nombre}" />
                <input id="apellido" class="swal2-input" placeholder="Apellido" value="${profesor.apellido}" />
                <input id="email" class="swal2-input" placeholder="Correo electrónico" value="${profesor.email}" />
            `,
            focusConfirm: false,
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Guardar',
            preConfirm: () => {
                const nombre = document.getElementById('nombre').value;
                const apellido = document.getElementById('apellido').value;
                const email = document.getElementById('email').value;

                if (!nombre || !apellido || !email) {
                    Swal.showValidationMessage('Por favor complete todos los campos');
                    return false;
                }

                if (!email.includes('@')) {
                    Swal.showValidationMessage('Por favor ingrese un correo electrónico válido');
                    return false;
                }

                return { nombre, apellido, email };
            }
        });

        if (formValues) {
            try {
                const response = await axiosInstance.put(`/profesores/${profesor.id}`, formValues);

                if (response.data.status === 'success') {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'Profesor actualizado correctamente',
                    });
                    fetchProfesores();
                }
            } catch (error) {
                const errorMessage = error.response?.data?.error || 'Error al actualizar el profesor';
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage,
                });
            }
        }
    };

    const handleViewProfesor = async (id) => {
        try {
            const response = await axiosInstance.get(`/profesores/${id}/detalle`);
            if (response.data.status === 'success') {
                const profesor = response.data.profesor;
                
                // Crea el contenido HTML para los proyectos guiados
                const proyectosGuiadosHTML = profesor.proyectos_guiados.map(p => `
                    <div class="mb-4 p-4 bg-blue-50 rounded-lg">
                        <h4 class="font-semibold">${p.titulo}</h4>
                        <p class="text-sm text-gray-600">${p.descripcion}</p>
                        <p class="text-sm mt-2">
                            <span class="font-medium">Estudiante:</span> ${p.estudiante}
                            <br>
                            <span class="font-medium">Email:</span> ${p.estudiante_email}
                        </p>
                    </div>
                `).join('') || '<p class="text-gray-500">No hay proyectos guiados</p>';
    
                // Crea el contenido HTML para los proyectos informados
                const proyectosInformadosHTML = profesor.proyectos_informados.map(p => `
                    <div class="mb-4 p-4 bg-green-50 rounded-lg">
                        <h4 class="font-semibold">${p.titulo}</h4>
                        <p class="text-sm text-gray-600">${p.descripcion}</p>
                        <p class="text-sm mt-2">
                            <span class="font-medium">Estudiante:</span> ${p.estudiante}
                            <br>
                            <span class="font-medium">Email:</span> ${p.estudiante_email}
                        </p>
                    </div>
                `).join('') || '<p class="text-gray-500">No hay proyectos informados</p>';
    
                await Swal.fire({
                    title: `${profesor.nombre} ${profesor.apellido}`,
                    html: `
                        <div class="text-left">
                            <p class="mb-4">
                                <span class="font-medium">Email:</span> ${profesor.email}
                            </p>
                            
                            <div class="mb-6">
                                <h3 class="text-lg font-semibold mb-3 text-blue-600">
                                    Proyectos Guiados (${profesor.total_proyectos_guiados})
                                </h3>
                                <div class="max-h-60 overflow-y-auto">
                                    ${proyectosGuiadosHTML}
                                </div>
                            </div>
                            
                            <div>
                                <h3 class="text-lg font-semibold mb-3 text-green-600">
                                    Proyectos Informados (${profesor.total_proyectos_informados})
                                </h3>
                                <div class="max-h-60 overflow-y-auto">
                                    ${proyectosInformadosHTML}
                                </div>
                            </div>
                        </div>
                    `,
                    width: '700px',
                    showCloseButton: true,
                    showConfirmButton: false,
                    customClass: {
                        container: 'swal-wide',
                        popup: 'swal-tall',
                        content: 'swal-content'
                    }
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la información del profesor'
            });
        }
    };
  

    const handleDelete = async (id) => {
      if (profesores.find(p => p.id === id).proyectos_guiados > 0 || 
          profesores.find(p => p.id === id).proyectos_informados > 0) {
          await Swal.fire({
              icon: 'error',
              title: 'No se puede eliminar',
              text: 'El profesor tiene proyectos activos asignados',
              confirmButtonText: 'Entendido'
          });
          return;
      }
  
      const result = await Swal.fire({
          title: '¿Estás seguro?',
          text: 'No podrás revertir esto',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
      });
  
      if (result.isConfirmed) {
          try {
              const response = await axiosInstance.delete(`/profesores/${id}`);
              if (response.data.status === 'success') {
                  await Swal.fire({
                      icon: 'success',
                      title: 'Eliminado',
                      text: 'El profesor ha sido eliminado con éxito',
                  });
                  fetchProfesores(); 
              }
          } catch (err) {
              console.error('Error al eliminar:', err);
              const errorMessage = err.response?.data?.error || 'Error al eliminar el profesor';
              await Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: errorMessage, 
              });
          }
      }
  };

  const filteredProfesores = profesores.filter(profesor =>
    profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profesor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profesor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Cargando profesores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10"
        style={{
          backgroundImage: 'url("/img/uct.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">Administración de Profesores</h2>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre, apellido o correo..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-200">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apellido
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proyectos Guiados
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proyectos Informados
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfesores.map((profesor) => (
                    <tr key={profesor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profesor.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profesor.apellido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profesor.email}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {profesor.proyectos_guiados || 0}
                      </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {profesor.proyectos_informados || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                            onClick={() => handleViewProfesor(profesor.id)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver
                          </button>
                          <button 
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            onClick={() => handleEditProfesor(profesor)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button 
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                            onClick={() => handleDelete(profesor.id)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleAddProfesor}
                className="inline-flex items-center px-4 py-2 bg-green-200 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Agregar profesor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfesores;