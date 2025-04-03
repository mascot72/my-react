declare module '../components/atoms/uia-wafermap' {
  export function shotmap(elementId: string): {
    size: (width: number, height: number) => unknown
    notch: (direction: string) => unknown
    wheel: (enabled: boolean) => unknown
    drag: (enabled: boolean) => unknown
    diePalette: (callback: (value: number) => number) => unknown
  }
}
