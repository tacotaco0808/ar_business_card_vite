import * as THREE from "three";

import cameraPara from "../data/camera_para.dat?url";
import markerURL from "../data/patt.hiro?url";

import { myARToolkit } from "./myARToolkit";

export const main = () => {
  /*renderer */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setSize(640, 480);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.body.appendChild(renderer.domElement);
  //
  /*シーンとマテリアル */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 640 / 480, 0.01, 20);
  camera.position.set(1, 1.5, 1.5);
  camera.lookAt(new THREE.Vector3(0, 0.5, 0));
  scene.add(camera);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(2.4, 2, 5);
  scene.add(light);

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xe5e5e5 })
  );
  box.position.set(0, 0.5, 0);
  scene.add(box);

  /*Ar.js(ほとんどテンプレート) */
  const { arToolkitContext, arToolkitSource } = myARToolkit({
    camera: camera,
    cameraParaDatURL: cameraPara,
    domElement: renderer.domElement,
    markerPatternURL: markerURL,
    scene,
  });
  window.addEventListener("markerFound", function (e) {
    console.log("マーカー検出", e);
  });

  /*レンダリングループ */
  const clock = new THREE.Clock();
  requestAnimationFrame(function animate() {
    requestAnimationFrame(animate);
    if (arToolkitSource.ready) {
      //マーカー検出によって、camera_objのvisibleが動的に処理
      arToolkitContext.update(arToolkitSource.domElement);
      scene.visible = camera.visible;
    }
    /*アニメーション */
    const detla = clock.getDelta();
    box.rotation.x += detla * 1.0;
    box.rotation.y += detla * 1.0;
    renderer.render(scene, camera);
  });
};

// bodyをタップでAR開始する処理
let isInit = false;
window.addEventListener("load", () => {
  document.body.addEventListener("click", async () => {
    if (!isInit) {
      main();
      isInit = true;
    }

    if (document.fullscreenElement === null) {
      await document.body.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  });
});
