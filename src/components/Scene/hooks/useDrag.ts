import CameraControls from "camera-controls";
import { MutableRefObject, useEffect, useRef } from "react";
import * as THREE from "three";

import { gridSize } from "../Scene";
import { ISize } from "./useResizeObserver";

interface IUseDragProps {
  render: () => void;
  sizeRef: MutableRefObject<ISize>;
  getObject: (
    pos: THREE.Vector2,
    from?: THREE.Object3D<THREE.Event>[] | undefined
  ) => THREE.Intersection<THREE.Object3D<THREE.Event>>;
}

export const useDrag = ({
  render,
  sizeRef,
  getObject,
}: IUseDragProps) => {
  const draggableRef = useRef<THREE.Object3D | null>(null);
  const objectsRef = useRef<Array<THREE.Object3D<THREE.Event>>>([]);
  // const sizeRef = useRef<ISize>({ width, height });
  const isRotationActive = useRef<boolean>(false);

  // const updateSize = (props: ISize) => {
  //   sizeRef.current = props;
  // };

  const getDraggableTarget = ({
    isWireFrameActive,
    object,
  }: {
    isWireFrameActive?: boolean;
    object: THREE.Object3D<THREE.Event>;
  }) => {
    let target: THREE.Object3D<THREE.Event>;
    if (object.parent?.type === "Group" || object.type === "Group") {
      if (object.parent?.type === "Group") {
        target = object.parent;
      } else {
        target = object;
      }

      target.children.forEach((child) => {
        if ("material" in child) {
          (child.material as THREE.MeshStandardMaterial)?.setValues({
            wireframe: isWireFrameActive,
          });
        }
      });
    } else {
      target = object;
      if ("material" in object) {
        (object.material as THREE.MeshStandardMaterial)?.setValues({
          wireframe: isWireFrameActive,
        });
      }
    }

    return target;
  };

  const mouseup = (event: MouseEvent) => {
    if (draggableRef.current != null) {
      const target: THREE.Object3D<THREE.Event> = getDraggableTarget({
        object: draggableRef.current,
        isWireFrameActive: false,
      });
      render();

      draggableRef.current = null;
      return;
    }
  };
  const mousedown = (event: MouseEvent, callback?: () => void) => {
    const x = (event.clientX / sizeRef.current.width) * 2 - 1;
    const y = -(event.clientY / sizeRef.current.height) * 2 + 1;

    const found = getObject(new THREE.Vector2(x, y), objectsRef.current);
    if (!found) return;

    const target: THREE.Object3D<THREE.Event> = getDraggableTarget({
      object: found.object,
      isWireFrameActive: true,
    });

    callback?.();

    draggableRef.current = target;
    render();
  };
  const mousemove = (event: MouseEvent) => {
    if (draggableRef.current != null) {
      const x = (event.clientX / sizeRef.current.width) * 2 - 1;
      const y = -(event.clientY / sizeRef.current.height) * 2 + 1;

      const found = getObject(new THREE.Vector2(x, y));
      if (!found) return;
      let target = found.point;

      if (isRotationActive.current) {
        const targetX = target.x - draggableRef.current.position.x;
        const targetZ = target.z - draggableRef.current.position.z;
        const hypotenuse = Math.sqrt(
          Math.pow(targetX, 2) + Math.pow(targetZ, 2)
        );

        draggableRef.current.rotation.y =
          Math.asin(targetZ / hypotenuse) * (targetX > 0 ? -1 : 1) + Number(targetX < 0) * Math.PI;
      } else {
        // TODO: object width
        draggableRef.current.position.x =
          Math.floor(target.x /*(event.clientX - width / 2)*/ / gridSize) +
          gridSize / 2;
        draggableRef.current.position.z =
          Math.floor(target.z /*(event.clientX - width / 2)*/ / gridSize) +
          gridSize / 2;
        draggableRef.current.position.y =
          draggableRef.current.userData.startY + target.y; //+ gridSize / 2;
      }

      render();
    }
  };

  useEffect(() => {
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

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);

    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      console.log("clear drag listeners");
    };
  }, []);

  return {
    objectsRef,
    // updateSize,
    mouseup,
    mousedown,
    mousemove
  };
};
