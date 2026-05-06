export const formatearMiles = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const num = String(value).replace(/\./g, '').replace(/[^0-9]/g, '');
  if (num === '') return '';
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const limpiarMiles = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\./g, '').replace(/[^0-9]/g, '');
};
