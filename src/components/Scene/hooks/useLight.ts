import * as THREE from "three";
import { useEffect, useRef } from "react";

interface IUseLightProps {
  scene: THREE.Scene;
}

export const useLight = ({ scene }: IUseLightProps) => {
  const spotLightRef = useRef<THREE.SpotLight>(
    new THREE.SpotLight(0xeeebee, 0.8)
  );
  const ambientLightRef = useRef<THREE.AmbientLight>(
    new THREE.AmbientLight(0xeeeeee)
  );

  useEffect(() => {
    spotLightRef.current.position.set(0, 20, 20);
    spotLightRef.current.lookAt(0, 0, 0);

    spotLightRef.current.castShadow = true;

    const spotLightHelpers = initSpotLightHelpers(spotLightRef.current);

    scene.add(
      ambientLightRef.current,
      spotLightRef.current,
      ...spotLightHelpers
    );
  }, []);

  return {
    spotLight: spotLightRef.current,
    ambientLight: ambientLightRef.current,
  };
};

const initSpotLightHelpers = (spotLight: THREE.SpotLight) => {
  const spotLightHelper = new THREE.SpotLightHelper(spotLight, 5);
  const spotShadowHelper = new THREE.CameraHelper(spotLight.shadow.camera);

  return [spotLightHelper, spotShadowHelper];
};
