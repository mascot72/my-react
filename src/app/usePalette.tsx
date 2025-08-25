import React, { createContext, useContext, useState } from 'react'

export type PaletteType = 'Step' | 'Gradation'
export type PaletteGroup = {
  name: string
  type: PaletteType
  colors: string[]
  stops?: { from: number; to: number }[]
}

type PaletteContextType = {
  appliedPalette: PaletteGroup | null
  setAppliedPalette: (p: PaletteGroup | null) => void
}

export const PaletteContext = createContext<PaletteContextType>({
  appliedPalette: null,
  setAppliedPalette: () => {},
})

export const usePalette = () => useContext(PaletteContext)

export const PaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appliedPalette, setAppliedPalette] = useState<PaletteGroup | null>(null)
  return <PaletteContext.Provider value={{ appliedPalette, setAppliedPalette }}>{children}</PaletteContext.Provider>
}
