import { MutableRefObject, useEffect, useRef } from "react"

export interface ISize { width: number, height: number }


export const useResizeObserver = (elRef: MutableRefObject<HTMLDivElement | null>, onChange?: (props: ISize) => void) => {
  // const firstQuery = Object.keys(breakpoints[0])[0]
  // const [breakSize, setBreakSize] = React.useState(firstQuery)
  const sizeRef = useRef<ISize>({ width: innerWidth, height: innerHeight });

  const observerRef = useRef(
    new ResizeObserver(entries => {
      // Only care about the first element, we expect one element ot be watched
      const { width, height } = entries[0].contentRect;

      sizeRef.current = { width, height };

      console.log(sizeRef.current);

      onChange?.({ width, height });

      // setBreakSize(findBreakPoint(breakpoints, width))
    })
  )

  useEffect(() => {
    if (elRef.current) {
      observerRef.current.unobserve(elRef.current)
      observerRef.current.observe(elRef.current)
    }

    return () => {
      if (!elRef.current) return;
      observerRef.current.unobserve(elRef.current)
    }
  }, [])

  return sizeRef;
}