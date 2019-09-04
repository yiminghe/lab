import {
  BufferGeometry,
  Color,
  DoubleSide,
  AxesHelper,
  Float32BufferAttribute,
  Group,
  LineSegments,
  LineBasicMaterial,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  GridHelper,
  ParametricGeometry,
  WireframeGeometry,
  WebGLRenderer
} from "../threejs/three.module.js";

import { GUI } from '../threejs/dat.gui.module.js';
import { OrbitControls } from '../threejs/OrbitControls.js';

function updateGroupGeometry(mesh, geometrys) {
  geometrys.forEach((geometry, index) => {
    if (geometry.isGeometry) {

      geometry = new BufferGeometry().fromGeometry(geometry);

      console.warn('THREE.GeometryBrowser: Converted Geometry to BufferGeometry.');

    }
    index = index * 2;
    mesh.children[index].geometry.dispose();
    mesh.children[index + 1].geometry.dispose();

    mesh.children[index].geometry = new WireframeGeometry(geometry);
    mesh.children[index + 1].geometry = geometry;
  });
}

var guis = {

  ParametricGeometry(mesh) {

    var data = {
      slices: 25,
      stacks: 25
    };

    document.title = `x^2+y^2-z^2=4`;

    // x^2+y^2-z^2=4

    function generateGeometryX() {

      updateGroupGeometry(mesh,
        [ new ParametricGeometry((u, v, p) => {
          u = 20 * u - 10;
          v = 20 * v - 10;
          let z = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2) - 4);
          if (isNaN(z)) {
            // ??
            p.set(0, 0, 0);
          } else {
            p.set(u, v, z);
          }
        }, data.slices, data.stacks),
          new ParametricGeometry((u, v, p) => {
            u = 20 * u - 10;
            v = 20 * v - 10;
            let z = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2) - 4);
            if (isNaN(z)) {
              // ??
              p.set(0, 0, 0);
            } else {
              p.set(u, v, -z);
            }
          }, data.slices, data.stacks) ]
      );

    }

    function getParametricGeometry(n) {
      return new ParametricGeometry((u, v, p) => {
        v *= 2 * Math.PI;
        u = (10*u + 2);
        const x = u * Math.sin(v);
        const y = u * Math.cos(v);
        let z = Math.sqrt(u * u - 4);
        if (n) {
          z = -z;
        }
        p.set(x, y, z);
      }, data.slices, data.stacks);
    }

    function generateGeometry() {
      updateGroupGeometry(mesh,
        [
          getParametricGeometry(),
          getParametricGeometry(true),
        ]
      );
    }

    var folder = gui.addFolder('THREE.ParametricGeometry');

    folder.add(data, 'slices', 1, 100).step(1).onChange(generateGeometry);
    folder.add(data, 'stacks', 1, 100).step(1).onChange(generateGeometry);

    generateGeometry();

  },
};

function chooseFromHash(mesh) {
  guis.ParametricGeometry(mesh);
  return { fixed: true }
}

var gui = new GUI();

var scene = new Scene();
scene.background = new Color(0x444444);

var camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.z = 30;

var renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableZoom = false;

var lights = [];
lights[0] = new PointLight(0xffffff, 1, 0);
lights[1] = new PointLight(0xffffff, 1, 0);
lights[2] = new PointLight(0xffffff, 1, 0);

lights[0].position.set(0, 200, 0);
lights[1].position.set(100, 200, 100);
lights[2].position.set(-100, -200, -100);

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

var group = new Group();

var geometry = new BufferGeometry();
geometry.addAttribute('position', new Float32BufferAttribute([], 3));

var lineMaterial = new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
var meshMaterial = new MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, side: DoubleSide, flatShading: true });

group.add(new LineSegments(geometry, lineMaterial));
group.add(new Mesh(geometry, meshMaterial));
group.add(new LineSegments(geometry, lineMaterial));
group.add(new Mesh(geometry, meshMaterial));
var options = chooseFromHash(group);

scene.add(group);

var axesHelper = new AxesHelper(50);
// 和网格模型Mesh一样，AxesHelper你也可以理解为一个模型对象，需要插入到场景中
scene.add(axesHelper);

// var gridHelper = new GridHelper(100, 10);
// scene.add(gridHelper);
group.rotation.x += Math.PI / 2;


var render = function () {

  requestAnimationFrame(render);

  if (!options.fixed) {

    group.rotation.x += 0.005;
    group.rotation.y += 0.005;

  }

  renderer.render(scene, camera);

};

window.addEventListener('resize', function () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}, false);

render();
