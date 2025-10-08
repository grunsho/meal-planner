/**
 * Creates a Zustand store with optional Immer and persistence middleware.
 *
 * @template T - The shape of the store's state.
 * @param storeCreator - A function that defines the store's state and actions.
 * @param config - Optional configuration for persistence and storage.
 * @param config.name - The name of the persisted store in storage.
 * @param config.storage - The storage engine to use (defaults to localStorage).
 * @param config.skipPersist - If true, disables persistence middleware.
 * @param config.excludeFromPresist - Array of state keys to exclude from persistence.
 * @returns A Zustand store instance with configured middleware.
 */

import { create } from 'zustand'
import { StateCreator } from 'zustand/vanilla'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'

type ConfigType<T> = {
  name?: string
  storage?: Storage
  skipPersist?: boolean
  excludeFromPresist?: Array<keyof T>
}

const createStore = <T extends object>(
  storeCreator: StateCreator<T, [['zustand/immer', never]], []>,
  config?: ConfigType<T>
) => {
  const { name, storage, skipPersist, excludeFromPresist } = config || {}

  const immerStore = immer(storeCreator)

  if (skipPersist) {
    return create<T>()(immerStore)
  }

  return create<T>()(
    persist(immerStore, {
      name: name || 'zustand-store',
      storage: createJSONStorage(() => storage || localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !excludeFromPresist?.includes(key as keyof T)
          )
        ),
    })
  )
}

export { createStore }
