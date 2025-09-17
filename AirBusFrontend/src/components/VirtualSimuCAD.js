import { useState, useEffect, Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import Plane from "./Plane"
import { Leva } from "leva"
import * as THREE from "three"
import { simulateFault, mapFaultToCoordinates, findShortestPath } from "./utils"
import "./VirtualSimuCAD.css"

const wireProperties = [
  { length: 10, start: { x: -7, y: 5, z: 20 } },
  { length: 15, start: { x: -3, y: 5, z: -3 } },
  { length: 20, start: { x: -3, y: 16, z: -3 } },
  { length: 25, start: { x: -5, y: 16, z: 25 } },
  { length: 5, start: { x: -5, y: 7, z: 25 } },
  { length: 7, start: { x: -2, y: 7, z: 15 } },
  { length: 12, start: { x: -5, y: 7, z: -4 } }
]

const graph = {
  "-18,7,48": ["-7,5,20"], //Fin 1     take the user inputs
  "-18,7,40": ["-7,5,20"], //Fin 2
  "-11,7,40": ["-7,5,20"], //Fin 3
  "-18,10,50": ["-7,5,20"], //Fin 4
  "-7,5,20": ["-3,5,-3", "-3,16,-3"],
  "-3,5,-3": ["-7,5,20", "-5,7,25", "-5,7,4"],
  "-3,16,-3": ["-7,5,20", "-5,16,25", "-5,7,4"],
  "-5,16,25": ["-3,16,-3", "-5,7,25"],
  "-5,7,25": ["-3,16,-3", "-5,16,25", "-2,7,15"],
  "-5,7,4": ["-3,5,-3", "-3,16,-3"],
  "-2,7,15": ["-5,7,25"]
}

function Sphere({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[1.3, 32, 32]} />
      <meshBasicMaterial color="green" />
    </mesh>
  )
}

function VirtualSimuCAD() {
  const [faultyWireLocations, setFaultyWireLocations] = useState([])
  const [selectedWireLength, setSelectedWireLength] = useState(5)
  const [selectedFin, setSelectedFin] = useState("Fin 1")
  const [start, setStart] = useState({ x: -7, y: 5, z: 20 })
  const [target, setTarget] = useState({ x: -5, y: 7, z: 25 })
  const [shortestPath, setShortestPath] = useState([])

  useEffect(() => {
    const selectedWire = wireProperties.find(wire => wire.length === selectedWireLength)
    if (selectedWire) {
      const { faultDistance } = simulateFault(selectedWire, selectedWire.length / 2) // Example: fault at half the wire length
      const faultLocation = mapFaultToCoordinates(selectedWire.start, faultDistance)
      setFaultyWireLocations([faultLocation])
      setTarget(faultLocation) // Update target to fault location
    } else {
      setFaultyWireLocations([])
      setTarget({ x: -5, y: 7, z: 25 }) // Reset target to default
    }
  }, [selectedWireLength])

  useEffect(() => {
    // Logic for updating start position based on selected Fin
    switch (selectedFin) {
      case "Fin 1":
        setStart({ x: -18, y: 7, z: 48 })
        break
      case "Fin 2":
        setStart({ x: -18, y: 7, z: 40 })
        break
      case "Fin 3":
        setStart({ x: -11, y: 7, z: 40 })
        break
      case "Fin 4":
        setStart({ x: -18, y: 10, z: 50 })
        break
      default:
        break
    }
  }, [selectedFin])

  useEffect(() => {
    const { path } = findShortestPath(start, target, graph)
    if (path) {
      setShortestPath(path)
    } else {
      setShortestPath([])
    }
  }, [start, target])

  const handleWireLengthChange = e => {
    setSelectedWireLength(parseInt(e.target.value))
  }

  const handleFinChange = e => {
    const fin = e.target.value
    setSelectedFin(fin)
  }

  const pathPoints = useMemo(() => {
    return shortestPath.map(point => {
      const [x, y, z] = point.split(",").map(Number)
      return new THREE.Vector3(x, y, z)
    })
  }, [shortestPath])

  const pathGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(pathPoints)
    return geometry
  }, [pathPoints])

  return (
    <div className="VirtualSimu">
      <Leva />
      <div>
        <label htmlFor="wireLength" style={{ color: "#269bd6" }}>
          <strong>Wire Length:</strong>
        </label>
        <select id="wireLength" value={selectedWireLength} onChange={handleWireLengthChange}>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={25}>25</option>
          <option value={5}>5</option>
          <option value={7}>7</option>
          <option value={12}>12</option>
        </select>
      </div>
      <div>
        <label htmlFor="fin" style={{ color: "#269bd6" }}>
          <strong>Functional Identification Number:</strong>
        </label>
        <select id="fin" value={selectedFin} onChange={handleFinChange}>
          <option value="Fin 1">Fin 1</option>
          <option value="Fin 2">Fin 2</option>
          <option value="Fin 3">Fin 3</option>
          <option value="Fin 4">Fin 4</option>
        </select>
      </div>
      <Canvas className="ThreeD">
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={1} />
        <Environment preset="night" />
        <OrbitControls />
        <Suspense fallback={null}>
          <Plane faultyWireLocations={faultyWireLocations} />
          {shortestPath.length > 0 && (
            <line>
              <bufferGeometry attach="geometry" {...pathGeometry} />
              <lineBasicMaterial attach="material" color="brown" linewidth={100} />
            </line>
          )}
          {start && <Sphere position={new THREE.Vector3(start.x, start.y, start.z)} />}
        </Suspense>
      </Canvas>
      <div>
        <h5>The Green sphere represents the location of the Functional Indentification Number.</h5>
        <h5>The Red blinking sphere represents the position of the estimated wire fault.</h5>
        <h5>The Brown line between the green and red Sphere represents the shortest distance from Fin to wire fault.</h5>
      </div>
    </div>
  )
}

export default VirtualSimuCAD
