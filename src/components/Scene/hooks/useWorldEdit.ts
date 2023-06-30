import { MutableRefObject, useEffect, useRef } from "react";
import * as THREE from "three";

import { ISize } from "./useResizeObserver";
import { gridSize } from "../Scene";
import { useHelpers } from "./useHelpers";

interface IUseWorldEditProps {
  land: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  sizeRef: MutableRefObject<ISize>;
  scene: THREE.Scene;
  render: () => void;
  getObject: (
    pos: THREE.Vector2,
    from?: THREE.Object3D<THREE.Event>[] | undefined
  ) => THREE.Intersection<THREE.Object3D<THREE.Event>>;
  objectsRef: MutableRefObject<Array<THREE.Object3D<THREE.Event>>>;
  getArea: ({
    radius,
    x0,
    z0,
    callback,
  }: {
    radius: number;
    x0: number;
    z0: number;
    callback: (props: {
      zWorldIndex: number;
      xWorldIndex: number;
      zWorldEditorIndex: number;
      xWorldEditorIndex: number;
    }) => void;
  }) => void;
  landEditCoefficient: number;
  radius: number;
}

enum EWordEditorVector {
  UP = "up",
  DOWN = "down",
}

export const useWorldEdit = ({
  land,
  sizeRef,
  scene,
  render,
  getObject,
  getArea,
  objectsRef,
  landEditCoefficient,
  radius,
}: IUseWorldEditProps) => {
  const wordEditorRadius = useRef<THREE.Mesh<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.MeshBasicMaterial
  > | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const isWordEditorActive = useRef<boolean>(false);
  const wordEditorVector = useRef<EWordEditorVector | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [])

  const mousemove = (event: MouseEvent) => {
    if (!wordEditorRadius.current) return;
    const x = (event.clientX / sizeRef.current.width) * 2 - 1;
    const y = -(event.clientY / sizeRef.current.height) * 2 + 1;
    const found = getObject(new THREE.Vector2(x, y));

    if (!found) return;

    const target = found.point;
    const z0 = Math.floor(target.z / gridSize);
    const x0 = Math.floor(target.x / gridSize);
    // scene.remove()
    wordEditorRadius.current.position.set(x0, 0, z0);

    const wordEditorPosition =
      wordEditorRadius.current.geometry.getAttribute("position");
    const landPosition = land.geometry.getAttribute("position");

    const edit = () => {
      if (!wordEditorRadius.current) return;
      getArea({
        radius,
        x0,
        z0,
        callback({
          xWorldEditorIndex,
          xWorldIndex,
          zWorldEditorIndex,
          zWorldIndex,
        }) {
          const y = landPosition.getZ(xWorldIndex + zWorldIndex);

          const y0 = isWordEditorActive.current
            ? y +
              landEditCoefficient *
                (wordEditorVector.current === EWordEditorVector.DOWN ? -1 : 1)
            : y;

          if (isWordEditorActive.current) {
            landPosition.setZ(xWorldIndex + zWorldIndex, y0);
          }
          wordEditorPosition.setZ(xWorldEditorIndex + zWorldEditorIndex, y0);
        },
      });

      wordEditorPosition.needsUpdate = true;
      wordEditorRadius.current.updateMatrix();
      wordEditorRadius.current.geometry.computeBoundingBox();
      wordEditorRadius.current.geometry.computeBoundingSphere();

      if (isWordEditorActive.current) {
        landPosition.needsUpdate = true;
        land.updateMatrix();
        land.geometry.computeBoundingBox();
        land.geometry.computeBoundingSphere();

        objectsRef.current.map((object) => {
          if (
            object.position.x > x0 - radius &&
            object.position.x < x0 + radius &&
            object.position.z > z0 - radius &&
            object.position.z < z0 + radius
          ) {
            object.position.set(
              object.position.x,
              object.position.y +
                landEditCoefficient *
                  (wordEditorVector.current === EWordEditorVector.DOWN
                    ? -1
                    : 1),
              object.position.z
            );
          }
        });
      }

      render();
    };

    edit();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (isWordEditorActive.current) {
      intervalRef.current = setInterval(edit, 16);
    }
  };
  const mouseup = (event: MouseEvent) => {
    isWordEditorActive.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  const mousedown = (event: MouseEvent) => {
    if (!wordEditorRadius.current) return;
    isWordEditorActive.current = true;
  };

  const createWorldEditor = () => {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff00,
      side: THREE.DoubleSide,
    });

    const planeGeometry = new THREE.PlaneGeometry(
      radius * 2,
      radius * 2,
      radius * 2,
      radius * 2
    );

    const plane = new THREE.Mesh(planeGeometry, material);

    plane.rotation.x = Math.PI / -2;

    scene.add(plane);
    wordEditorRadius.current = plane;
    render();
  };

  const onActivateUp = () => {
    if (
      wordEditorRadius.current &&
      wordEditorVector.current === EWordEditorVector.UP
    ) {
      scene.remove(wordEditorRadius.current);
      wordEditorRadius.current = null;
      wordEditorVector.current = null;
      render();
      return;
    }

    wordEditorVector.current = EWordEditorVector.UP;

    if (!wordEditorRadius.current) {
      createWorldEditor();
    }
  };

  const onActivateDown = () => {
    if (
      wordEditorRadius.current &&
      wordEditorVector.current === EWordEditorVector.DOWN
    ) {
      scene.remove(wordEditorRadius.current);
      wordEditorRadius.current = null;
      // isDragActive.current = true;
      wordEditorVector.current = null;
      render();
      return;
    }

    wordEditorVector.current = EWordEditorVector.DOWN;
    // isDragActive.current = false;

    if (!wordEditorRadius.current) {
      createWorldEditor();
    }
  };

  return {
    mousedown,
    mouseup,
    mousemove,
    onActivateDown,
    onActivateUp,
    isWordEditorActive,
    wordEditorVector,
  }
};
