import { useRef } from "react";

export const useRotation = () => {
  const isRotationActive = useRef<boolean>(false);

  const keydown = (event: KeyboardEvent) => {
    if (event.code === "ShiftLeft") {
      isRotationActive.current = true;
    }
  };
  const keyup = (event: KeyboardEvent) => {
    if (event.code === "ShiftLeft") {
      isRotationActive.current = false;
    }
  };
}