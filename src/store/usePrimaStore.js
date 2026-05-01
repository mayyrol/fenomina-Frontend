import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePrimaStore = create(
  persist(
    (set) => ({
      procesoActual:         null,
      empleadosSeleccionados: [],

      setProcesoActual:          (proceso)   => set({ procesoActual: proceso }),
      setEmpleadosSeleccionados: (empleados) => set({ empleadosSeleccionados: empleados }),

      limpiarProceso: () =>
        set({ procesoActual: null, empleadosSeleccionados: [] }),
    }),
    {
      name: 'prima-store',
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