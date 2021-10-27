import { camera, renderer } from "./moon.js";
import { switchCamera, switchRenderer } from "./switch.js";

//please, Raffaele of the future, fix this
//https://imgflip.com/i/5s16ry
window.addEventListener("resize", () => {
  console.log("resizeee");
  if (window.innerWidth <= 800) {
    var dynamicHeight = (window.innerWidth * 50) / 100;
    camera.aspect = window.innerWidth / dynamicHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, dynamicHeight);
    switchCamera.aspect = window.innerWidth / dynamicHeight;
    switchCamera.updateProjectionMatrix();
    switchRenderer.setSize(window.innerWidth, dynamicHeight);
    // camera2.aspect = window.innerWidth / dynamicHeight;
    // camera2.updateProjectionMatrix();
    // renderer2.setSize(window.innerWidth, dynamicHeight);
  } else {
    camera.aspect = 340 / 505;
    camera.updateProjectionMatrix();
    renderer.setSize(340, 505);
    switchCamera.aspect = 340 / 505;
    switchCamera.updateProjectionMatrix();
    switchRenderer.setSize(340, 505);
    // camera2.aspect = 340 / 505;
    // camera2.updateProjectionMatrix();
    // renderer2.setSize(340, 505);
  }
});
