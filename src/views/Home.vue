<template>
  <div className='earth_digital'>
    <canvas className='webgl'></canvas>
    <section className="bg"></section>
    <div class="homeContainer">
      <el-container>
        <el-header>
          <div class="title">可视化大屏标题<el-icon class="back" @click="back()">
              <CloseBold />
            </el-icon></div>
        </el-header>
        <el-main>
          <div class="left">
            <div class="leftTitle">按件区-放大功能</div>
            <div v-for="(item) in buttonLists" :key="item.id" class="buttonList" @click="change(item.id)">
              {{ item.name }}
            </div>
          </div>
          <div class="middle">
            <component :is="Chart1" :height="630" :width="630" v-if="comName == 'Chart1'"></component>
            <component :is="Chart2" :height="630" :width="630" v-if="comName == 'Chart2'"></component>
            <component :is="Chart3" :height="630" :width="630" v-if="comName == 'Chart3'"></component>
            <component :is="Chart4" :height="630" :width="630" v-if="comName == 'Chart4'"></component>
            <component :is="Chart5" :height="630" :width="630" v-if="comName == 'Chart5'"></component>
          </div>
          <div class="right">
            <div class="top">
              <div class="top1" @click="change(3)">
                <Chart3 :height="300" :width="300" />
              </div>
              <div class="top2">
                <Chart4 />
              </div>
            </div>
            <div class="bottom">
              <Chart1 />
            </div>
          </div>
        </el-main>
        <el-footer>
          <div class="footer1">
            <Chart2 />
          </div>
          <div class="footer2">
            <chart5 />
          </div>
        </el-footer>
      </el-container>
    </div>
    <StarBackground />
  </div>
</template>

<script setup lang="ts">
import StarBackground from '../components/StarBackground.vue'
import Chart1 from '../components/Chart1.vue'
import Chart2 from '../components/Chart2.vue'
import Chart3 from '../components/Chart3.vue'
import Chart4 from '../components/Chart4.vue'
import Chart5 from '../components/Chart5.vue'
import { ref, reactive, onMounted } from 'vue'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import * as dat from 'dat.gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import imgData from '../assets/earth.jpg';
import { useRouter } from 'vue-router'
var comName = ref("Chart3")
const router = useRouter()
const buttonLists = reactive([{
  id: 1,
  name: "饼状图"
}, {
  id: 2,
  name: "散点图"
}, {
  id: 3,
  name: "流量图"
}, {
  id: 4,
  name: "折线图"
}, {
  id: 5,
  name: "柱状图"
}, {
  id: 6,
  name: "视频区"
}])
function change(flag: number) {
  switch (flag) {
    case 1:
      comName.value = "Chart3"
      console.log(comName)
      break;
    case 2:
      comName.value = "Chart4"
      console.log(comName)
      break;
    case 3:
      comName.value = "Chart5"
      console.log(comName)
      break;
    case 4:
      comName.value = "Chart2"
      console.log(comName)
      break;

    default:
      comName.value = "Chart1"
      console.log(comName)
      break;
  }
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
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .01, 50);
  camera.position.set(0, 0, 15.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl'),
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 后期
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const glitchPass = new GlitchPass();
  composer.addPass(glitchPass);

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
    composer.setSize(window.innerWidth, window.innerHeight);
  }
}
window.addEventListener("resize", function () {
  this.location.reload()
});

const back = () => {
  router.push({
    path: "/"
  })
}
onMounted(() => {
  initThree()
})
</script>

<style>
.earth_digital{
  position: relative;
}
.webgl{
  position: fixed;
    z-index: 1;
    cursor: pointer;
   width: 5.208333rem /* 1000/192 */;
   left: -0.1%;
}
.bg {
    position: fixed;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    width: 200%;
    height: 200vh;
    background: #000000 url('../assets/noise.png') repeat 0 0;
    background-repeat: repeat;
    animation: bg-animation .2s infinite;
    visibility: visible;
  }
.homeContainer {
  position: absolute;
  z-index: 11 !important;
  height: 100%;
  width: 100vw;
  /* overflow: hidden; */
  background-color: #050608;

}

.back {
  float: right;
  color: #0dc4e6;
}

.el-header {
  height: .442708rem
    /* 85/192 */
  ;
  width: 100%;
  background-image: url("../assets/header.png");
  background-size: cover;
  /* opacity: 0.85; */
  box-shadow: 0 0 .104167rem
    /* 20/192 */
    .052083rem
    /* 10/192 */
    black inset;
}

.title {
  font-size: .15625rem
    /* 30/192 */
  ;
  margin-top: .0625rem
    /* 12/192 */
  ;
}

.el-main {
  width: 100%;
  padding: 0;
  height: 3.4375rem
    /* 660/192 */
  ;
  display: flex;
  justify-content: space-evenly;
  background-image: url(../assets/panel3.png);
  background-size: cover;
  overflow: hidden;
}

.left {
  text-align: center;
  width: 1.260417rem
    /* 242/192 */
  ;
  background-image: url(../assets/chart-wrapper.png);
  background-size: contain;
  background-repeat: round;
}

.leftTitle {
  margin: .364583rem
    /* 70/192 */
    .104167rem
    /* 20/192 */
  ;
  height: .260417rem
    /* 50/192 */
  ;
  font-size: .104167rem
    /* 20/192 */
  ;
  text-align: center;
  line-height: .260417rem
    /* 50/192 */
  ;
}

.buttonList {
  border-radius: .052083rem
    /* 10/192 */
  ;
  height: .260417rem
    /* 50/192 */
  ;
  margin: .15625rem
    /* 30/192 */
    .104167rem
    /* 20/192 */
  ;
  background-image: url(../assets/tab-active.png);
  background-size: cover;
  font-size: .104167rem
    /* 20/192 */
  ;
  text-align: center;
  line-height: .260417rem
    /* 50/192 */
  ;
}

.middle {
  width: 3.4375rem
    /* 660/192 */
  ;
}

#chart2 {
  margin: .15625rem
    /* 30/192 */
  ;
}

.right {
  width: 5.15625rem
    /* 990/192 */
  ;
}

.top {
  width: 100%;
  height: 1.71875rem
    /* 330/192 */
  ;
  display: flex;
}

.top1 {
  width: 1.71875rem
    /* 330/192 */
  ;
  background-image: url(../assets/chart-wrapper.png);
  background-size: cover;
}

.top2 {
  width: 3.4375rem
    /* 660/192 */
  ;
  background-image: url(../assets/chart-wrapper.png);
  background-size: cover;
}

.bottom {
  width: 100%;
  height: 1.71875rem
    /* 330/192 */
  ;
  display: flex;
  background-image: url(../assets/chart-wrapper.png);
  background-size: cover;
}



.el-footer {
  width: 100%;
  display: flex;
  height: 1.71875rem
    /* 330/192 */
  ;
  margin: 0 .036458rem
    /* 7/192 */
  ;
  padding: 0;

}

.footer1 {
  width: 4.734375rem
    /* 909/192 */
  ;
  background-image: url(../assets/chart-wrapper.png);
  background-size: cover;
}

.footer2 {
  margin-left: .036458rem
    /* 7/192 */
  ;
  width: 5.15625rem
    /* 990/192 */
  ;
  background-image: url(../assets/chart-wrapper.png);
  background-size: cover;
}
</style>