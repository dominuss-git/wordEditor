import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

import { positions } from "../Scene";
import { MutableRefObject } from "react";

export const renderGrass = ({
  scene,
  gridSize,
  render,
  objectsRef,
}: {
  scene: THREE.Scene;
  gridSize: number;
  objectsRef: MutableRefObject<Array<THREE.Object3D<THREE.Event>>>
  render: () => void;
}) => {
  const loader = new GLTFLoader();
  loader.load(
    "./grass/scene.gltf",
    (gltf) => {
      gltf?.scene?.traverse?.(function (object) {
        if (object.isObject3D && "isMesh" in object && object.isMesh) {
          object.setRotationFromEuler(new THREE.Euler(11, 0, 0, "ZYX"));

          positions.forEach((_, pos1) => {
            positions.forEach((_, pos2) => {
              const obj1 = object.clone(true);
              const obj2 = object.clone(true);
              const obj3 = object.clone(true);
              const obj4 = object.clone(true);
              // const ra

              obj1.position.x = pos1 + gridSize / 2;
              obj1.position.z = pos2 + gridSize / 2;
              obj2.position.x = -pos1 - gridSize / 2;
              obj2.position.z = pos2 + gridSize / 2;
              obj3.position.x = pos1 + gridSize / 2;
              obj3.position.z = -pos2 - gridSize / 2;
              obj4.position.x = -pos1 - gridSize / 2;
              obj4.position.z = -pos2 - gridSize / 2;
              obj1.receiveShadow = true;
              obj2.receiveShadow = true;
              obj3.receiveShadow = true;
              obj4.receiveShadow = true;
              obj1.castShadow = true;
              obj2.castShadow = true;
              obj3.castShadow = true;
              obj4.castShadow = true;
              obj1.userData.startY = 0; 
              obj2.userData.startY = 0; 
              obj3.userData.startY = 0; 
              obj4.userData.startY = 0;
              
              objectsRef.current.push(obj1, obj2, obj3, obj4)

              scene.add(obj1, obj2, obj3, obj4);
            });
          });
        }
      });
      render();
    },
    (xhr) => {
      // called while loading is progressing
      console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
      // called when loading has errors
      console.error("An error happened", error);
    }
  );
};
