<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import StarBackground from '../components/StarBackground.vue'
import { useRouter, } from 'vue-router'
import { ElMessage } from 'element-plus';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import * as dat from 'dat.gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import imgData from '../assets/earth.jpg';

const labelPosition = ref('right')
const earth = ref()
const loginForm = reactive({
  name: '',
  password: '',
})
const router = useRouter()
const login = () => {
    router.push({
      path:"/home"
    })
  // if (loginForm.name == "admin" && loginForm.password == "1q2w3E*"){
  //   console.log("111")
  //   router.push({
  //     path:"/home"
  //   })
  // }else{
  //   ElMessage.error('用户或密码输入错误，请重试')
  // }
}
const state = {
  // week: weekMap[new Date().getDay()],
  time: '00:00:00',
  showModal: false,
  // modelText: tips[0],
  renderGlithPass: false
}

const initThree = () => {
  let earth: any;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, (window.innerWidth*2/3) / (window.innerHeight*2/3), .01, 50);
  camera.position.set(0, 0, 15.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl'),
    antialias: true,
    alpha: true
  });
  const renderer2 = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl2'),
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth*2/3 , window.innerHeight*2/3);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer2.setSize(window.innerWidth*2/3 , window.innerHeight*2/3);
  renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // 后期
  const composer = new EffectComposer(renderer);
  const composer2 = new EffectComposer(renderer2);
  composer.addPass(new RenderPass(scene, camera));
  composer2.addPass(new RenderPass(scene, camera));
  const glitchPass = new GlitchPass();
  composer.addPass(glitchPass);
  composer2.addPass(glitchPass);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;

  let params = {
    colors: { base: '#0dc4e6', gradInner: '#0dc4e6', gradOuter: '#0dc4e6' },
    reset: () => { controls.reset() }
  }

  let maxImpactAmount = 10;
  let impacts: any = [];
  let trails: any = [];
  for (let i = 0; i < maxImpactAmount; i++) {
    impacts.push({
      impactPosition: new THREE.Vector3().random().subScalar(0.5).setLength(5),
      impactMaxRadius: 5 * THREE.Math.randFloat(0.5, 0.75),
      impactRatio: 0,
      prevPosition: new THREE.Vector3().random().subScalar(0.5).setLength(5),
      trailRatio: { value: 0 },
      trailLength: { value: 0 }
    });
  }

  let uniforms = {
    impacts: {
      value: impacts
    },
    maxSize: {
      value: 0.04
    },
    minSize: {
      value: 0.025
    },
    waveHeight: {
      value: 0.1
    },
    scaling: {
      value: 1
    },
    gradInner: {
      value: new THREE.Color(params.colors.gradInner)
    },
    gradOuter: {
      value: new THREE.Color(params.colors.gradOuter)
    }
  }


  makeGlobeOfPoints();
  window.addEventListener('resize', onWindowResize);

  const gui = new dat.GUI();
  gui.add(uniforms.maxSize, 'value', 0.01, 0.06).step(0.001).name('陆地');
  gui.add(uniforms.minSize, 'value', 0.01, 0.06).step(0.001).name('海洋');
  gui.add(uniforms.waveHeight, 'value', 0.1, 1).step(0.001).name('浪高');
  gui.add(uniforms.scaling, 'value', 1, 5).step(0.01).name('范围');
  gui.addColor(params.colors, 'base').name('基础色').onChange((val: any) => {
    earth && earth.material.color.set(val);
  });
  gui.addColor(params.colors, 'gradInner').name('渐变内').onChange((val: any) => {
    uniforms.gradInner.value.set(val);
  });
  gui.addColor(params.colors, 'gradOuter').name('渐变外').onChange((val: any) => {
    uniforms.gradOuter.value.set(val);
  });
  gui.add(params, 'reset').name('重置');
  gui.hide();

  renderer.setAnimationLoop((_: any) => {
    earth.rotation.y += 0.001;
    renderer.render(scene, camera);
    state.renderGlithPass && composer.render();
  });
  renderer2.setAnimationLoop((_: any) => {
    earth.rotation.y += 0.001;
    renderer2.render(scene, camera);
    state.renderGlithPass && composer2.render();
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  window.addEventListener('dblclick', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(earth.children);
    if (intersects.length > 0) {
      state.showModal = true
    }
  }, false);

  function makeGlobeOfPoints() {
    let dummyObj = new THREE.Object3D();
    let p = new THREE.Vector3();
    let sph = new THREE.Spherical();
    let geoms = [];
    let tex = new THREE.TextureLoader().load(imgData);
    let counter = 75000;
    let rad = 5;
    let r = 0;
    let dlong = Math.PI * (3 - Math.sqrt(5));
    let dz = 2 / counter;
    let long = 0;
    let z = 1 - dz / 2;
    for (let i = 0; i < counter; i++) {
      r = Math.sqrt(1 - z * z);
      p.set(Math.cos(long) * r, z, -Math.sin(long) * r).multiplyScalar(rad);
      z = z - dz;
      long = long + dlong;
      sph.setFromVector3(p);
      dummyObj.lookAt(p);
      dummyObj.updateMatrix();
      let g = new THREE.PlaneGeometry(1, 1);
      g.applyMatrix4(dummyObj.matrix);
      g.translate(p.x, p.y, p.z);
      let centers = [
        p.x, p.y, p.z,
        p.x, p.y, p.z,
        p.x, p.y, p.z,
        p.x, p.y, p.z
      ];
      let uv = new THREE.Vector2(
        (sph.theta + Math.PI) / (Math.PI * 2),
        1. - sph.phi / Math.PI
      );
      let uvs = [
        uv.x, uv.y,
        uv.x, uv.y,
        uv.x, uv.y,
        uv.x, uv.y
      ];
      g.setAttribute('center', new THREE.Float32BufferAttribute(centers, 3));
      g.setAttribute('baseUv', new THREE.Float32BufferAttribute(uvs, 2));
      geoms.push(g);
    }
    let g = mergeBufferGeometries(geoms);
    let m = new THREE.MeshBasicMaterial({
      color: new THREE.Color(params.colors.base),
      onBeforeCompile: (shader: { uniforms: { impacts: { value: any }; maxSize: { value: number }; minSize: { value: number }; waveHeight: { value: number }; scaling: { value: number }; gradInner: { value: any }; gradOuter: { value: any }; tex: { value: any } }; vertexShader: string; fragmentShader: string }) => {
        shader.uniforms.impacts = uniforms.impacts;
        shader.uniforms.maxSize = uniforms.maxSize;
        shader.uniforms.minSize = uniforms.minSize;
        shader.uniforms.waveHeight = uniforms.waveHeight;
        shader.uniforms.scaling = uniforms.scaling;
        shader.uniforms.gradInner = uniforms.gradInner;
        shader.uniforms.gradOuter = uniforms.gradOuter;
        shader.uniforms.tex = { value: tex };
        shader.vertexShader = `
            struct impact {
              vec3 impactPosition;
              float impactMaxRadius;
              float impactRatio;
            };
            uniform impact impacts[${maxImpactAmount}];
            uniform sampler2D tex;
            uniform float maxSize;
            uniform float minSize;
            uniform float waveHeight;
            uniform float scaling;

            attribute vec3 center;
            attribute vec2 baseUv;

            varying float vFinalStep;
            varying float vMap;

            ${shader.vertexShader}
          `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
            float finalStep = 0.0;
            for (int i = 0; i < ${maxImpactAmount};i++){
              float dist = distance(center, impacts[i].impactPosition);
              float curRadius = impacts[i].impactMaxRadius * impacts[i].impactRatio;
              float sstep = smoothstep(0., curRadius, dist) - smoothstep(curRadius - ( 0.25 * impacts[i].impactRatio ), curRadius, dist);
              sstep *= 1. - impacts[i].impactRatio;
              finalStep += sstep;
            }
            finalStep = clamp(finalStep, 0., 1.);
            vFinalStep = finalStep;

            float map = texture(tex, baseUv).g;
            vMap = map;
            float pSize = map < 0.5 ? maxSize : minSize;
            float scale = scaling;

            transformed = (position - center) * pSize * mix(1., scale * 1.25, finalStep) + center; // scale on wave
            transformed += normal * finalStep * waveHeight; // lift on wave
            `
        );
        shader.fragmentShader = `
            uniform vec3 gradInner;
            uniform vec3 gradOuter;
            varying float vFinalStep;
            varying float vMap;
            ${shader.fragmentShader}
            `.replace(
          `vec4 diffuseColor = vec4( diffuse, opacity );`,
          `
            // shaping the point, pretty much from The Book of Shaders
            vec2 hUv = (vUv - 0.5);
            int N = 8;
            float a = atan(hUv.x,hUv.y);
            float r = PI2/float(N);
            float d = cos(floor(.5+a/r)*r-a)*length(hUv);
            float f = cos(PI / float(N)) * 0.5;
            if (d > f) discard;

            vec3 grad = mix(gradInner, gradOuter, clamp( d / f, 0., 1.)); // gradient
            vec3 diffuseMap = diffuse * ((vMap > 0.5) ? 0.5 : 1.);
            vec3 col = mix(diffuseMap, grad, vFinalStep); // color on wave
            //if (!gl_FrontFacing) col *= 0.25; // moderate the color on backside
            vec4 diffuseColor = vec4( col , opacity );
            `
        );
      }
    });
    m.defines = { 'USE_UV': '' };
    earth = new THREE.Mesh(g, m);
    earth.rotation.y = Math.PI;
    trails.forEach((t: any) => { earth.add(t) });
    earth.position.set(0, -.4, 0);
    scene.add(earth);
  }




  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer2.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer2.setSize(window.innerWidth, window.innerHeight);
  }
}
onMounted(()=>{
  initThree()
})
</script>

<template>
  <div class="login-container">
    <canvas class='webgl'></canvas>
    <canvas class='webgl2'></canvas>
    <div class="projectTitle">XXXXX数据可视化展示项目</div>
    <div class="loginContent">
      <div class="loginEarth" id="loginEarth" ref="earth">
        
      </div>
      <el-form :label-position="labelPosition" label-width="100px" :model="loginForm" class="login">
        <div class="loginTitle">登陆界面</div>
        <el-form-item label="Name" class="item">
          <el-input v-model="loginForm.name"  />
        </el-form-item>
        <el-form-item label="Password" class="item">
          <el-input v-model="loginForm.password" />
        </el-form-item>
        <el-button class="loginButton" @click="login">登录</el-button>
      </el-form>
    </div>
  </div>
  <StarBackground />

</template>

<style scoped>



.login-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #050608;
  align-items: center;
}

.projectTitle {
  font-size: .364583rem /* 70/192 */;
  margin-top: .78125rem /* 150/192 */;
  color: white;
  text-shadow: 0 0 .052083rem /* 10/192 */ #fff,
    0 0 .104167rem /* 20/192 */ #fff,
    0 0 .416667rem /* 80/192 */ #0dc4e6,
    0 0 .520833rem /* 100/192 */ #0dc4e6,
    0 0 .78125rem /* 150/192 */ #0dc4e6;
}

.loginContent {
  z-index: 999 !important;
  margin-top: .520833rem /* 100/192 */ ;
  width: 100%;
  height: 2.083333rem /* 400/192 */;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
}

.loginEarth {
  position:absolute;
  right: 6.5rem /* 1200/192 */;
  top: .859375rem /* 165/192 */ /* 100/192 */;
  height: 5.729167rem /* 1100/192 */;
  width: 5.729167rem /* 1100/192 */ /* 1000/192 */;
  border-radius: 50%;
  border-radius: 50%;
  box-shadow: 0 0 .520833rem /* 100/192 */ /* 150/192 */ rgb(0, 153, 184) inset, 0 0 .052083rem /* 10/192 */ rgb(0, 153, 184);
}
.webgl{
  z-index: 1 !important;
  position: absolute;
 cursor: pointer;
 left: 4.30875rem /* 810/192 */;
 bottom: 2.0090067rem;
width: 10rem /* 1920/192 */ !important;
height: 5.625rem /* 1080/192 */ !important;
}
.webgl2{
  z-index: 1 !important;
  position: absolute;
  right: 4.30875rem /* 810/192 */;
  top: 2.0090067rem /* 380/192 */;
 cursor: pointer;
width: 10rem /* 1920/192 */ !important;
height: 5.625rem /* 1080/192 */ !important;
}

img{
  width: 100%;
}
/* padding: 30px 50px 50px 50px */
.login {
  z-index: 9999;
  margin-top: .625rem /* 120/192 */;
  width: 3.083333rem /* 400/192 */;
  height: 1.5625rem /* 300/192 */;
  border-radius: .104167rem /* 20/192 */;
  box-shadow: 0 0 .520833rem /* 100/192 */ rgb(0, 153, 184) inset, 0 0 .052083rem /* 10/192 */ rgb(0, 153, 184);
  background-image: url(../assets/chart-wrapper.png);
  background-size: cover;
}

:deep() .el-form-item__label {
  color: white;
  text-shadow: 0 0 .052083rem /* 10/192 */ #fff,
    0 0 .104167rem /* 20/192 */ #fff,
    0 0 .416667rem /* 80/192 */ #0dc4e6,
    0 0 .520833rem /* 100/192 */ #0dc4e6,
    0 0 .78125rem /* 150/192 */ #0dc4e6;
}
.loginTitle {
  font-size: .15625rem /* 30/192 */;
  margin-top: .234375rem /* 45/192 */;
  color: white;
  text-shadow: 0 0 .052083rem /* 10/192 */ #fff,
    0 0 .104167rem /* 20/192 */ #fff,
    0 0 .416667rem /* 80/192 */ #0dc4e6,
    0 0 .520833rem /* 100/192 */ #0dc4e6,
    0 0 .78125rem /* 150/192 */ #0dc4e6;
}
.item{
  height: .15625rem /* 30/192 */ ;
  width: 2.4375rem /* 180/192 */;
  margin: .130208rem /* 25/192 */ auto ;
}
.loginButton {
  height: .208333rem /* 40/192 */;
  background-color: rgb(61, 61, 61);
  color: #fff;
  font-size: .114583rem /* 22/192 */;
  border: 0px;
  margin-top: .054167rem /* 20/192 */;
  text-shadow: 0 0 .052083rem /* 10/192 */ #fff,
    0 0 .104167rem /* 20/192 */ #fff,
    0 0 .416667rem /* 80/192 */ #0dc4e6,
    0 0 .520833rem /* 100/192 */ #0dc4e6,
    0 0 .78125rem /* 150/192 */ #0dc4e6;
}
</style>

