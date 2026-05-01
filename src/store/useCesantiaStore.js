import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCesantiaStore = create(
  persist(
    (set) => ({
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
    }),
    {
      name: 'cesantia-store',
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