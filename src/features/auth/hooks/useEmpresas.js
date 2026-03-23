import { useState } from 'react';

export function useEmpresas() {
  const [pagina, setPagina]     = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [size, setSize]         = useState(20);

  const todasEmpresas = [
    { id: 1,  nombre: 'Evernet',                        nitEmpresa: '900.123.456', razonSocial: 'Evernet S.A.S',                        ley1607: 'SI', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'SI',  logo: null },
    { id: 2,  nombre: 'Add Marketing',                  nitEmpresa: '800.234.567', razonSocial: 'Add Marketing Ltda',                   ley1607: 'NO', reportesNomina: 'SI', reportesPrimas: 'NO', reportesCesantias: 'NO',  logo: null },
    { id: 3,  nombre: 'Tornillos Chía',                 nitEmpresa: '700.345.678', razonSocial: 'Tornillos Chía S.A',                   ley1607: 'SI', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'SI',  logo: null },
    { id: 4,  nombre: 'Inversiones Velasquez Cantillo', nitEmpresa: '900.336.004', razonSocial: 'Inversiones Velasquez Cantillo S.A.S', ley1607: 'NO', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'SI',  logo: null },
    { id: 5,  nombre: 'Ai Currea Franco',               nitEmpresa: '900.456.789', razonSocial: 'Ai Currea Franco S.A.S',               ley1607: 'SI', reportesNomina: 'NO', reportesPrimas: 'NO', reportesCesantias: 'NO', logo: null },
    { id: 6,  nombre: 'Inversiones Sanchez Brand',      nitEmpresa: '800.567.890', razonSocial: 'Inversiones Sanchez Brand Ltda',       ley1607: 'NO', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'NO', logo: null },
    { id: 7,  nombre: 'CyM Soluciones Textiles',        nitEmpresa: '900.678.901', razonSocial: 'CyM Soluciones Textiles S.A.S',        ley1607: 'SI', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'SI', logo: null },
    { id: 8,  nombre: 'Almas Group',                    nitEmpresa: '700.789.012', razonSocial: 'Almas Group S.A',                      ley1607: 'NO', reportesNomina: 'SI', reportesPrimas: 'NO', reportesCesantias: 'SI', logo: null },
    { id: 9,  nombre: 'Cardamomo',                      nitEmpresa: '900.890.123', razonSocial: 'Cardamomo S.A.S',                      ley1607: 'SI', reportesNomina: 'NO', reportesPrimas: 'SI', reportesCesantias: 'NO', logo: null },
    { id: 10, nombre: 'Carnes Chía S.A.S',              nitEmpresa: '800.901.234', razonSocial: 'Carnes Chía S.A.S',                    ley1607: 'NO', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'SI', logo: null },
    { id: 11, nombre: 'Nova Diego',                     nitEmpresa: '900.012.345', razonSocial: 'Nova Diego S.A.S',                     ley1607: 'SI', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'SI', logo: null },
    { id: 12, nombre: 'Inversiones Orion',              nitEmpresa: '700.123.456', razonSocial: 'Inversiones Orion Ltda',               ley1607: 'NO', reportesNomina: 'NO', reportesPrimas: 'SI', reportesCesantias: 'SI', logo: null },
    { id: 13, nombre: 'Polyad',                         nitEmpresa: '900.234.567', razonSocial: 'Polyad S.A.S',                         ley1607: 'SI', reportesNomina: 'SI', reportesPrimas: 'NO', reportesCesantias: 'NO', logo: null },
    { id: 14, nombre: 'PRIIGO',                         nitEmpresa: '800.345.678', razonSocial: 'PRIIGO S.A',                           ley1607: 'NO', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'SI', logo: null },
    { id: 15, nombre: 'La Principal del Hierro',        nitEmpresa: '900.456.123', razonSocial: 'La Principal del Hierro S.A.S',        ley1607: 'SI', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'NO', logo: null },
    { id: 16, nombre: 'Inversiones San Antonio',        nitEmpresa: '700.567.234', razonSocial: 'Inversiones San Antonio Ltda',         ley1607: 'NO', reportesNomina: 'NO', reportesPrimas: 'NO', reportesCesantias: 'SI', logo: null },
    { id: 17, nombre: 'Yury Leon',                      nitEmpresa: '900.678.345', razonSocial: 'Yury Leon S.A.S',                      ley1607: 'SI', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'SI', logo: null },
    { id: 18, nombre: 'Servicampo',                     nitEmpresa: '800.789.456', razonSocial: 'Servicampo S.A',                       ley1607: 'NO', reportesNomina: 'SI', reportesPrimas: 'NO', reportesCesantias: 'SI', logo: null },
    { id: 19, nombre: 'SIGMA Inversiones',              nitEmpresa: '900.890.567', razonSocial: 'SIGMA Inversiones S.A.S',              ley1607: 'SI', reportesNomina: 'SI', reportesPrimas: 'SI', reportesCesantias: 'SI', logo: null },
  ];

  const empresasFiltradas = todasEmpresas.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas   = Math.ceil(empresasFiltradas.length / size);
  const empresasPagina = empresasFiltradas.slice(pagina * size, pagina * size + size);

  const getEmpresaById = (id) => todasEmpresas.find(e => e.id === Number(id));

  return {
    empresas: empresasPagina,
    total: empresasFiltradas.length,
    totalPaginas,
    cargando: false,
    error: null,
    pagina, setPagina,
    busqueda, setBusqueda,
    size, setSize,
    getEmpresaById,
  };
}