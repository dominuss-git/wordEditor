import { MutableRefObject } from "react";
import * as THREE from "three";

export const renderCube = ({
  scene,
  objectsRef,
  render,
}: {
  scene: THREE.Scene;
  objectsRef: MutableRefObject<Array<THREE.Object3D<THREE.Event>>>;
  render: () => void;
}) => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  cube.receiveShadow = true;

  cube.position.set(1 / 2, 1 / 2, 1 / 2);
  cube.userData.startY = 1 / 2;

  // cube.rotation.y = 20;

  // cube.position.y = 1 / 2;
  // cube.userData.draggable = true;
  objectsRef.current.push(cube);

  scene.add(cube);

  render();
};
