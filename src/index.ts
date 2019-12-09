import * as three from 'three'
import simplexNoise from 'simplex-noise'
import { OrbitControls } from 'three-orbitcontrols-ts'

class Main {
  scene!: three.Scene
  renderer!: three.WebGLRenderer
  width: number = window.innerWidth
  height: number = window.innerHeight
  camera!: three.PerspectiveCamera
  noise!: simplexNoise
  factor = 0
  grid = {
    col: 50,
    row: 50,
  }
  control!: OrbitControls
  raycaster!: three.Raycaster
  mouse!: three.Vector2
  geometry!: three.BufferGeometry
  boxes = []

  init() {
    this.createScene()
    this.createCamera()
    this.addAmbientLight()
    this.addSpotlight()
    this.createShape()
    this.animate()
    document.body.style.margin = '0'
    window.addEventListener('mousemove', this.onMouseMove.bind(this), {
      passive: false,
    })
  }

  onMouseMove(event: { clientX: number; clientY: number }) {
    this.mouse.x = (event.clientX / this.width) * 2 - 1
    this.mouse.y = -(event.clientY / this.height) * 2 + 1
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.adjustVertices()
    this.renderer.render(this.scene, this.camera)
  }

  adjustVertices() {
    for (let i = 0; i < this.grid.col; i++) {
      for (let j = 0; j < this.grid.row; j++) {
        const distance = this.distance(
          j,
          i,
          this.grid.row * 0.5,
          this.grid.col * 0.5
        )

        const offset = three.Math.mapLinear(distance, 0, 400, -100, 100)

        const angle = this.factor + offset

        this.boxes[i][j].position.y = three.Math.mapLinear(
          Math.sin(angle),
          -1,
          1,
          this.noise.noise2D(i * 0.08, j * 0.1),
          1
        )
      }
    }

    this.factor -= 0.06
  }

  distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  }

  createShape() {
    this.geometry = new three.SphereBufferGeometry(0.07, 50, 50)
    const material = new three.MeshPhysicalMaterial({
      color: '#70BEF9',
    })
    for (let i = 0; i < this.grid.col; i++) {
      this.boxes[i] = []
      for (let j = 0; j < this.grid.col; j++) {
        const box = this.getBox(this.geometry, material)
        box.position.y = this.height * 0.5
        // box.scale.set(1, 0.001, 1)
        this.boxes[i][j] = box
        box.position.set(i - this.grid.col * 0.5, 0, j - this.grid.col * 0.5)
        this.scene.add(box)
      }
    }
  }

  getBox(
    geometry: three.Geometry | three.BufferGeometry | undefined,
    material: three.Material | three.Material[] | undefined
  ) {
    const mesh = new three.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true

    const pivot = new three.Object3D()
    pivot.add(mesh)
    return pivot
  }

  addSpotlight() {
    const light = new three.SpotLight('#fff', 1, 1000)
    light.position.set(0, 10, 60)
    this.scene.add(light)
  }

  addAmbientLight() {
    const light = new three.AmbientLight('#fff', 1)
    this.scene.add(light)
  }

  createCamera() {
    this.camera = new three.PerspectiveCamera(30, this.width / this.height, 1)
    this.camera.position.set(0, 50, 50)
    this.control = new OrbitControls(this.camera)
    this.control.enablePan = true
    this.control.enableZoom = true
    this.control.enableRotate = true
    this.control.update()
    this.scene.add(this.camera)
  }

  createScene() {
    this.scene = new three.Scene()
    this.mouse = new three.Vector2()
    this.renderer = new three.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(new three.Color('#CB2E3D'))
    document.body.appendChild(this.renderer.domElement)
    this.noise = new simplexNoise()
    this.raycaster = new three.Raycaster()
  }
}

const app = new Main()
app.init()
