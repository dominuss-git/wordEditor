import { useEffect, useRef } from "react";
import * as THREE from "three";

import { gridColumn, gridRow } from "../Scene";

const textureLoader = new THREE.TextureLoader()

export const useScene = () => {
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const landRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>>(initLand())

  useEffect(() => {
    sceneRef.current.background = new THREE.Color(0x87ceeb);

    // const land = initLand();
    const landHelpers = initLandHelpers()

    sceneRef.current.add(landRef.current, 
      ...landHelpers
      );

  }, []);

  return { scene: sceneRef.current, land: landRef.current }
};

const initLand = () => {
  const landGeometry = new THREE.PlaneGeometry(gridColumn, gridColumn, gridColumn, gridColumn);
  const landMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e4614,
    // fog: true,
    // side: THREE.DoubleSide,
    // map: textureLoader.load('./land.jpeg')
    // wireframe: true
  });
  const land = new THREE.Mesh(landGeometry, landMaterial);

  land.rotation.x = -0.5 * Math.PI;
  // land.position.x = -25;
  // land.position.z = -25;
  // land.position.y = -0.3;
  land.receiveShadow = true;
  land.castShadow = true;

  return land;
};

const initLandHelpers = () => {
  const gridHelper = new THREE.GridHelper(
    gridColumn,
    gridRow,
    0xffffff00,
    0xffff00
  );

  const axiosHelper = new THREE.AxesHelper(25);
  return [axiosHelper, gridHelper]
}