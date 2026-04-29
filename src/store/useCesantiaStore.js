import { create } from 'zustand';

export const useCesantiaStore = create((set) => ({
  procesoCesantiasActual:  null,
  procesoInteresesActual:  null,
  empleadosSeleccionados:  [],

  setProcesosCesantiasActual: (proceso) =>
    set({ procesoCesantiasActual: proceso }),

  setProcesosInteresesActual: (proceso) =>
    set({ procesoInteresesActual: proceso }),

  setEmpleadosSeleccionados: (empleados) =>
    set({ empleadosSeleccionados: empleados }),

  limpiarProceso: () =>
    set({
      procesoCesantiasActual: null,
      procesoInteresesActual: null,
      empleadosSeleccionados: [],
    }),
}));