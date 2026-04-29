import { create } from 'zustand';

export const useNominaStore = create((set) => ({
  procesoActual: null,
  empleadosSeleccionados: [],
  diasLaborados: {},

  setProcesoActual: (proceso) => set({ procesoActual: proceso }),

  setEmpleadosSeleccionados: (empleados) =>
    set({ empleadosSeleccionados: empleados }),

  setDiasLaborados: (dias) =>
    set({ diasLaborados: dias }),

  setDiasEmpleado: (empleadoId, dias) =>
    set((state) => ({
      diasLaborados: {
        ...state.diasLaborados,
        [empleadoId]: dias,
      },
    })),

  limpiarProceso: () =>
    set({
      procesoActual: null,
      empleadosSeleccionados: [],
      diasLaborados: {},
    }),
}));