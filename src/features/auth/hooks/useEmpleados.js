import { useState } from 'react';

export function useEmpleados() {
  const [pagina, setPagina]     = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab]           = useState('activos');
  const size = 10;

  const todosEmpleados = [
    { id: 1,  nombres: 'Pepito',        apellidos: 'Perez',              fechaIngreso: '30/01/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Sura',    pension: 'Sanitas',    arl: 'Colpensiones', caja: 'Colpensiones', estado: 'Activo' },
    { id: 2,  nombres: 'Carlos Andres', apellidos: 'Rodriguez Ochoa',    fechaIngreso: '30/12/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Sura',    pension: 'Sanitas',    arl: 'Colpensiones', caja: 'Colpensiones', estado: 'Activo' },
    { id: 3,  nombres: 'Alejandra Maria', apellidos: 'Anibal Leon',      fechaIngreso: '30/11/2022', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Colmena', pension: 'Compensar',  arl: 'Porvenir',     caja: 'Colpensiones', estado: 'Activo' },
    { id: 4,  nombres: 'Carlos Alberto', apellidos: 'Domingo Rodriguez', fechaIngreso: '30/01/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Sura',    pension: 'Famisanar',  arl: 'Colpensiones', caja: 'Colpensiones', estado: 'Activo' },
    { id: 5,  nombres: 'Samuel',        apellidos: 'Martinez Ramos',     fechaIngreso: '30/01/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Sura',    pension: 'Compensar',  arl: 'Colpensiones', caja: 'Colpensiones', estado: 'Activo' },
    { id: 6,  nombres: 'Maria Alexandra', apellidos: 'Caicedo Jimenez',  fechaIngreso: '30/01/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Colmena', pension: 'Compensar',  arl: 'Colpensiones', caja: 'Colpensiones', estado: 'Activo' },
    { id: 7,  nombres: 'Ramiro',        apellidos: 'Martinez Rativa',    fechaIngreso: '30/01/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Sura',    pension: 'Famisanar',  arl: 'Porvenir',     caja: 'Colpensiones', estado: 'Activo' },
    { id: 8,  nombres: 'Andres',        apellidos: 'Jimenez Ochoa',      fechaIngreso: '30/01/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Sura',    pension: 'Compensar',  arl: 'Porvenir',     caja: 'Colpensiones', estado: 'Activo' },
    { id: 9,  nombres: 'Carlos Andres', apellidos: 'Rubio Giraldo',      fechaIngreso: '30/01/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Sura',    pension: 'Compensar',  arl: 'Colpensiones', caja: 'Colpensiones', estado: 'Activo' },
    { id: 10, nombres: 'Yeimy',         apellidos: 'Castañeda Rodriguez', fechaIngreso: '30/01/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'SI', eps: 'Sura',    pension: 'Sanitas',    arl: 'Porvenir',     caja: 'Colpensiones', estado: 'Activo' },
    { id: 11, nombres: 'Ana Maria',     apellidos: 'Rodriguez Rodriguez', fechaIngreso: '30/01/2023', documento: '10528967', salario: '1.750.095', auxTransporte: 'NO', eps: 'Sura',    pension: 'Sanitas',    arl: 'Colpensiones', caja: 'Colpensiones', estado: 'Activo' },
    { id: 12, nombres: 'Juan Pablo',    apellidos: 'Gomez Perez',        fechaIngreso: '15/03/2023', documento: '20456789', salario: '1.750.095', auxTransporte: 'SI', eps: 'Sanitas', pension: 'Porvenir',   arl: 'Colpensiones', caja: 'Colpensiones', estado: 'Inactivo' },
    { id: 13, nombres: 'Laura Sofia',   apellidos: 'Herrera Castro',     fechaIngreso: '10/05/2022', documento: '30567890', salario: '2.000.000', auxTransporte: 'NO', eps: 'Sura',    pension: 'Famisanar',  arl: 'Porvenir',     caja: 'Colpensiones', estado: 'Retirado' },
    { id: 14, nombres: 'Miguel Angel',  apellidos: 'Torres Vargas',      fechaIngreso: '01/06/2023', documento: '40678901', salario: '1.750.095', auxTransporte: 'SI', eps: 'Colmena', pension: 'Compensar',  arl: 'Colpensiones', caja: 'Colpensiones', estado: 'Activo' },
    { id: 15, nombres: 'Diana Carolina', apellidos: 'Lopez Mendez',      fechaIngreso: '20/07/2023', documento: '50789012', salario: '1.900.000', auxTransporte: 'SI', eps: 'Sura',    pension: 'Sanitas',    arl: 'Porvenir',     caja: 'Colpensiones', estado: 'Activo' },
  ];

  const filtrados = todosEmpleados.filter(e => {
    const matchTab = tab === 'activos'   ? e.estado === 'Activo'
                   : tab === 'inactivos' ? e.estado === 'Inactivo'
                   : e.estado === 'Retirado';
    const matchBusqueda = `${e.nombres} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase());
    return matchTab && matchBusqueda;
  });

  const totalPaginas = Math.ceil(filtrados.length / size);
  const empleadosPagina = filtrados.slice(pagina * size, pagina * size + size);

  return {
    empleados: empleadosPagina,
    total: filtrados.length,
    totalPaginas,
    cargando: false,
    error: null,
    pagina, setPagina,
    busqueda, setBusqueda,
    tab, setTab,
    size,
  };
}