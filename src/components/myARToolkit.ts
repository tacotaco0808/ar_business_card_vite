import { THREEx } from "@ar-js-org/ar.js-threejs";
import { Camera, Scene } from "three";

export type ARToolkitInitOptions = {
  domElement: HTMLCanvasElement;
  camera: Camera;
  cameraParaDatURL: string;
  markerPatternURL: string;
  scene: Scene;
};

export const myARToolkit = ({
  domElement,
  camera,
  cameraParaDatURL,
  markerPatternURL,
  scene,
}: ARToolkitInitOptions) => {
  /*描画の設定 */
  const arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
    sourceWidth: window.innerWidth > window.innerHeight ? 640 : 480,
    sourceHeight: window.innerWidth > window.innerHeight ? 480 : 640,
  });
  /*カメラ側の設定 */
  const arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: cameraParaDatURL /*カメラキャリブレーション等の設定 */,
    detectionMode: "mono",
  });
  /*パターン画像に関する設定 */
  const arMarkerControls = new THREEx.ArMarkerControls( //一つのマーカーに対応
    arToolkitContext,
    camera, //マーカー発見時カメラに合わせて回転や移動するオブジェクト||複数マーカーつかう際はmodelViewMatrix
    {
      type: "pattern",
      patternUrl: markerPatternURL,
      changeMatrixMode: "cameraTransformMatrix", //
    }
  );
  /*描画の設定 */
  arToolkitSource.init(
    //画像ソース準備後3DObj_canvasとカメラ映像を画面いっぱいにリサイズ
    () => {
      //onReady
      arToolkitSource.domElement.addEventListener("canplay", () => {
        initARContext();
      });
      window.arToolkitSource = arToolkitSource;
      setTimeout(() => {
        onResize();
      }, 2000);
    },
    () => {
      /*onError */
    }
  );

  window.addEventListener("resize", function () {
    onResize();
  });

  function onResize() {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(domElement);
    if (window.arToolkitContext.arController !== null) {
      arToolkitSource.copyElementSizeTo(
        window.arToolkitContext.arController.canvas
      );
    }
  }

  function initARContext() {
    //カメラ側の設定？検出方法や、投影方法か 直訳:投影行列をカメラにコピー
    arToolkitContext.init(() => {
      /*3Dオブジェクトで投影する映像 */
      camera.projectionMatrix.copy(
        arToolkitContext.getProjectionMatrix() /*現実のカメラ映像 */
      );

      arToolkitContext.arController.orientatio = getSourceOrientation();
      arToolkitContext.arController.options.orientation =
        getSourceOrientation();
      window.arToolkitContext = arToolkitContext;
    });

    scene.visible = false;

    window.arMarkerControls = arMarkerControls;
  }
  function getSourceOrientation(): string {
    return arToolkitSource.domElement.videoWidth >
      arToolkitSource.domElement.videoHeight
      ? "landscape"
      : "portrait";
  }

  return {
    /**設定を返す */
    arToolkitSource,
    arToolkitContext,
    arMarkerControls,
  };
};
