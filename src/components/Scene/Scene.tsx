import { Fragment, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import throttle from "lodash.throttle";

import {
  useCamera,
  useDrag,
  useHelpers,
  useLight,
  useResizeObserver,
  useScene,
  useWorldEdit,
} from "./hooks";
import { renderCube, renderGrass } from "./utils";

const cameraOffset = 0.5;
export const gridColumn = 100;
export const gridRow = 100;
export const gridSize = gridColumn / gridRow;
export const positions = Array.from(Array(gridColumn / gridSize / 2));
const radius = 3;
const landEditCoefficient = 0.02;

const scrollNode = [
  { width: "100%", height: "20px", positions: ["top", "bottom"] },
  { width: "20px", height: "100%", positions: ["left", "right"] },
];

export const Scene = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const renderRef = useRef<THREE.WebGLRenderer>(new THREE.WebGLRenderer());
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const isDragActive = useRef<boolean>(true);

  const fullScreenRef = useRef<HTMLDivElement | null>(null);
  const isFullScreenActive = useRef<boolean>(false);

  const { scene, land } = useScene();
  const { onScrollEnd, onScrollStart, camera, cameraControlRef, updateAspect } =
    useCamera({
      scrollOffset: cameraOffset,
      renderer: renderRef.current,
    });
  const { ambientLight, spotLight } = useLight({ scene });
  const { getObject, getArea } = useHelpers({ land, camera });

  const render = () => {
    renderRef.current.render(scene, camera);
  };
  const anim = () => {
    const delta = clockRef.current.getDelta();
    const hasControlsUpdated = cameraControlRef.current!.update(delta);

    requestAnimationFrame(anim);
    // you can skip this condition to render though
    if (hasControlsUpdated) {
      render();
    }
  };

  const sizeRef = useResizeObserver(fullScreenRef, ({ width, height }) => {
    // updateSize({ width, height });
    renderRef.current.setSize(width, height, true);
    updateAspect(width / height);
    render();
  });
  const {
    objectsRef,
    // updateSize, 
    mousedown: onDragSelect,
    mouseup: onDragDeselect,
    mousemove: onDrag,
  } = useDrag({
    sizeRef,
    render,
    // width: innerWidth,
    // height: innerHeight,
    getObject,
  });


  const {
    mousedown: startWorldEdit,
    mousemove: onWorldEdit,
    mouseup: stopWorldEdit,
    onActivateDown,
    onActivateUp,
    wordEditorVector,
    isWordEditorActive,
  } = useWorldEdit({
    land,
    sizeRef,
    scene,
    render,
    getArea,
    getObject,
    objectsRef,
    landEditCoefficient,
    radius,
  });

  useEffect(() => {
    renderRef.current.shadowMap.enabled = true;
    renderRef.current.setSize(sizeRef.current.width, sizeRef.current.height);
    ref.current?.appendChild(renderRef.current.domElement);

    const mousemove = (event: MouseEvent) => {
      if (isDragActive.current && !wordEditorVector.current) {
        onDrag(event);
      }
      if (wordEditorVector.current) {
        onWorldEdit(event);
      }
    };
    const mouseup = (event: MouseEvent) => {
      if (isDragActive.current && !wordEditorVector.current) {
        onDragDeselect(event);
      }
      if (wordEditorVector.current) {
        stopWorldEdit(event);
      }

      if (cameraControlRef.current) cameraControlRef.current.enabled = true;
    };
    const mousedown = (event: MouseEvent) => {
      if (isDragActive.current && !wordEditorVector.current) {
        onDragSelect(event, () => {
          if (cameraControlRef.current)
            cameraControlRef.current.enabled = false;
        });
      }
      if (wordEditorVector.current) {
        if (cameraControlRef.current) cameraControlRef.current.enabled = false;
        startWorldEdit(event);
      }
    };

    renderRef.current.domElement.addEventListener("mousemove", mousemove);
    renderRef.current.domElement.addEventListener("mouseup", mouseup);
    renderRef.current.domElement.addEventListener("mousedown", mousedown);

    anim();
    onAdd();

    return () => {
      renderRef.current.domElement.removeEventListener("mousedown", mousedown);
      renderRef.current.domElement.removeEventListener("mouseup", mouseup);
      renderRef.current.domElement.removeEventListener("mousemove", mousemove);

      console.log("clear listeners");
    };
  }, []);

  const onAdd = () => {
    renderCube({ scene, objectsRef, render });
  };

  const onGrassRender = () => {
    renderGrass({ scene, gridSize, objectsRef, render });
  };

  const onAddModel = () => {
    const loader = new GLTFLoader();
    loader.load(
      "./che/scene.gltf",
      (gltf) => {
        try {
          // gltf.scene.receiveShadow = true;
          // gltf.scene.castShadow = true;
          const group = new THREE.Group();
          gltf?.scene?.traverse?.(function (object) {
            if (object.isObject3D && "isMesh" in object && object.isMesh) {
              // console.log(object);
              // group.add(object);
              console.log(object);

              object.setRotationFromEuler(new THREE.Euler(11, 0, 0, "ZYX"));
              object.position.y = 1;
              object.castShadow = true;
              object.receiveShadow = true;

              group.add(object.clone());
            }
          });

          group.userData.startY = 0;
          console.log(group);
          objectsRef.current.push(group);
          scene.add(group);
        } catch (e) {
          console.log(e);
        } finally {
          render();
        }
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

  const openFullscreen = () => {
    if (!fullScreenRef.current) return;

    if (isFullScreenActive.current) {
      isFullScreenActive.current = false;
      if (document.exitFullscreen) {
        document.exitFullscreen();
        // @ts-ignore
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        // @ts-ignore
        document.webkitExitFullscreen();
        // @ts-ignore
      } else if (document.msExitFullscreen) {
        /* IE11 */
        // @ts-ignore
        document.msExitFullscreen();
      }
    } else {
      isFullScreenActive.current = true;

      if (fullScreenRef.current.requestFullscreen) {
        fullScreenRef.current.requestFullscreen();
        // @ts-ignore
      } else if (fullScreenRef.current.webkitRequestFullscreen) {
        /* Safari */
        // @ts-ignore
        fullScreenRef.current.webkitRequestFullscreen();
        // @ts-ignore
      } else if (fullScreenRef.current.msRequestFullscreen) {
        /* IE11 */
        // @ts-ignore
        fullScreenRef.current.msRequestFullscreen();
      }
    }
  };

  return (
    <div
      ref={fullScreenRef}
      style={{
        position: "relative",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
        }}
        ref={ref}
      >
        {scrollNode.map(({ positions, ...node }) => {
          return (
            <Fragment key={positions.join(".")}>
              <div
                style={{
                  ...node,
                  position: "absolute",
                  backgroundColor: "red",
                  [positions[0]]: 0,
                }}
                onMouseEnter={() => onScrollStart(positions[0])}
                onMouseLeave={onScrollEnd}
              ></div>
              <div
                onMouseEnter={() => onScrollStart(positions[1])}
                onMouseLeave={onScrollEnd}
                style={{
                  ...node,
                  position: "absolute",
                  backgroundColor: "red",
                  [positions[1]]: 0,
                }}
              ></div>
            </Fragment>
          );
        })}
      </div>

      <button
        onClick={onAdd}
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
        }}
      >
        add
      </button>
      <button
        onClick={onAddModel}
        style={{
          position: "absolute",
          bottom: "30px",
          right: "10px",
        }}
      >
        add model
      </button>
      <button
        onClick={onGrassRender}
        style={{
          position: "absolute",
          bottom: "50px",
          right: "10px",
        }}
      >
        renderGrass
      </button>

      <button
        onClick={onActivateUp}
        style={{
          position: "absolute",
          bottom: "70px",
          right: "10px",
        }}
      >
        activate up
      </button>

      <button
        onClick={onActivateDown}
        style={{
          position: "absolute",
          bottom: "90px",
          right: "10px",
        }}
      >
        activate down
      </button>
      <button
        onClick={() => (isDragActive.current = !isDragActive.current)}
        style={{
          position: "absolute",
          bottom: "110px",
          right: "10px",
        }}
      >
        off drag
      </button>
      <button
        onClick={openFullscreen}
        style={{
          position: "absolute",
          bottom: "130px",
          right: "10px",
        }}
      >
        full screen
      </button>
    </div>
  );
};
