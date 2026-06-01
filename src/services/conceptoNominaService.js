import axiosInstance from '../api/axiosInstance';

const conceptoNominaService = {
  getConceptosContrato: () =>
    axiosInstance.get('/api/master/conceptos-nomina/contrato'),
};

export default conceptoNominaService;