import { create } from 'zustand';

export const usePrimaStore = create((set) => ({
  procesoActual:         null,
  empleadosSeleccionados: [],

  setProcesoActual:          (proceso)   => set({ procesoActual: proceso }),
  setEmpleadosSeleccionados: (empleados) => set({ empleadosSeleccionados: empleados }),

  limpiarProceso: () =>
    set({ procesoActual: null, empleadosSeleccionados: [] }),
}));