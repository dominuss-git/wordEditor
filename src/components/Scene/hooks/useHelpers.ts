import { useRef } from "react";
import * as THREE from "three";
import { gridColumn } from "../Scene";

interface IUseHelpersProps {
  camera: THREE.PerspectiveCamera;
  land: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
}

export const useHelpers = ({ camera, land }: IUseHelpersProps) => {
  const rayCasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  const getObject = (
    pos: THREE.Vector2,
    from?: Array<THREE.Object3D<THREE.Event>>
  ) => {
    rayCasterRef.current.setFromCamera(pos, camera);
    const found = rayCasterRef.current.intersectObjects(from || [land]);
    // console.log(found);
    return found[0];
  };

  const getArea = ({
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
  }) => {
    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        const zWorldIndex =
          Math.abs(gridColumn / 2 + z0 + j) * (gridColumn + 1);
        const xWorldIndex = gridColumn / 2 + x0 + i;
        const zWorldEditorIndex = Math.abs(radius + j) * (radius * 2 + 1);
        const xWorldEditorIndex = radius + i;

        callback({
          zWorldEditorIndex,
          zWorldIndex,
          xWorldEditorIndex,
          xWorldIndex,
        });

        // wordEditorPosition.setZ(
        //   xWorldEditorIndex + zWorldEditorIndex,
        //   landPosition.getZ(xWorldIndex + zWorldIndex)
        // );
      }
    }
  };

  return {
    getObject,
    getArea,
  };
};
