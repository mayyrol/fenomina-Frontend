import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNominaStore = create(
  persist(
    (set) => ({
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
    }),
    {
      name: 'nomina-store',
      storage: {
        getItem: (key) => {
          const value = sessionStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => sessionStorage.setItem(key, JSON.stringify(value)),
        removeItem: (key) => sessionStorage.removeItem(key),
      },
    }
  )
);