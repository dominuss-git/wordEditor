import * as THREE from "three";
import { useEffect, useRef } from "react";
import CameraControls from "camera-controls";

interface IUseCameraProps {
  // width: number;
  // height: number;
  // scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  scrollOffset: number;
}

CameraControls.install({ THREE: THREE });

export const useCamera = ({
  // width,
  // height,
  // scene,
  renderer,
  scrollOffset,
}: IUseCameraProps) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(
    new THREE.PerspectiveCamera(75, innerWidth / innerHeight , 0.1, 1000)
  );
  const cameraLookedAt = useRef({ x: 0, y: 0, z: 0 });
  const cameraControlRef = useRef<CameraControls>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const updateAspect = (aspect: number) => {
    cameraRef.current.aspect = aspect;
    cameraRef.current.updateProjectionMatrix()
  }

  const camera = () => {
    cameraRef.current.position.set(20, 20, 20);
    cameraRef.current.lookAt(
      cameraLookedAt.current.x,
      cameraLookedAt.current.y,
      0
    );
    cameraControlRef.current = new CameraControls(
      cameraRef.current,
      renderer.domElement
      // scene
    );
  };

  useEffect(camera, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const onScrollStart = (position: string) => {
    if (!cameraControlRef.current) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      const x =
        cameraControlRef.current!.camera.position.x - cameraLookedAt.current.x;
      const z =
        cameraControlRef.current!.camera.position.z - cameraLookedAt.current.z;

      const hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));
      const coefZ = Math.sin(x / hypotenuse);
      const coefX = Math.sin(z / hypotenuse);
      if (position === "right") {
        cameraControlRef.current!.camera.position.x =
          cameraControlRef.current!.camera.position.x + coefX * scrollOffset;
        cameraLookedAt.current.x =
          cameraLookedAt.current.x + coefX * scrollOffset;

        cameraControlRef.current!.camera.position.z =
          cameraControlRef.current!.camera.position.z - coefZ * scrollOffset;
        cameraLookedAt.current.z =
          cameraLookedAt.current.z - coefZ * scrollOffset;
      }
      if (position === "top") {
        cameraControlRef.current!.camera.position.x =
          cameraControlRef.current!.camera.position.x - coefZ * scrollOffset;
        cameraLookedAt.current.x =
          cameraLookedAt.current.x - coefZ * scrollOffset;

        cameraControlRef.current!.camera.position.z =
          cameraControlRef.current!.camera.position.z - coefX * scrollOffset;
        cameraLookedAt.current.z =
          cameraLookedAt.current.z - coefX * scrollOffset;
      }
      if (position === "left") {
        cameraControlRef.current!.camera.position.x =
          cameraControlRef.current!.camera.position.x - coefX * scrollOffset;
        cameraLookedAt.current.x =
          cameraLookedAt.current.x - coefX * scrollOffset;

        cameraControlRef.current!.camera.position.z =
          cameraControlRef.current!.camera.position.z + coefZ * scrollOffset;
        cameraLookedAt.current.z =
          cameraLookedAt.current.z + coefZ * scrollOffset;
      }
      if (position === "bottom") {
        cameraControlRef.current!.camera.position.x =
          cameraControlRef.current!.camera.position.x + coefZ * scrollOffset;
        cameraLookedAt.current.x =
          cameraLookedAt.current.x + coefZ * scrollOffset;

        cameraControlRef.current!.camera.position.z =
          cameraControlRef.current!.camera.position.z + coefX * scrollOffset;
        cameraLookedAt.current.z =
          cameraLookedAt.current.z + coefX * scrollOffset;
      }
      cameraControlRef.current?.setPosition(
        cameraControlRef.current.camera.position.x,
        cameraControlRef.current.camera.position.y,
        cameraControlRef.current.camera.position.z
      );
      cameraControlRef.current?.setLookAt(
        cameraControlRef.current?.camera.position.x,
        cameraControlRef.current?.camera.position.y,
        cameraControlRef.current?.camera.position.z,
        cameraLookedAt.current.x,
        cameraLookedAt.current.y,
        cameraLookedAt.current.z
      );
    }, 16);
  };

  const onScrollEnd = () => {
    clearInterval(intervalRef.current);
  };

  return {
    camera: cameraRef.current,
    cameraControlRef: cameraControlRef,
    onScrollStart,
    onScrollEnd,
    updateAspect,
  };
};
