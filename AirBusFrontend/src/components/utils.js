class PriorityQueue {
  constructor() {
    this.items = []
  }

  enqueue(element, priority) {
    const queueElement = { element, priority }
    let added = false
    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement)
        added = true
        break
      }
    }
    if (!added) {
      this.items.push(queueElement)
    }
  }

  dequeue() {
    return this.items.shift()
  }

  isEmpty() {
    return this.items.length === 0
  }
}

export function simulateFault(wire, faultDistance) {
  const { length, start } = wire
  const propagation_velocity = 2.5e8 // Meters per second (example for coaxial cable)
  const pulse_width = 100
  const pulse = Array(pulse_width).fill(0)
  pulse.fill(1, 0, 20)

  let faultType = "short"
  let reflection_coefficient = 0.5
  if (faultType === "open") {
    reflection_coefficient = -1
  }

  const reflected_signal = Array(pulse_width).fill(0)
  const reflection_delay = Math.floor(((2 * faultDistance) / propagation_velocity) * pulse.length)
  if (reflection_delay < pulse_width) {
    for (let i = reflection_delay; i < pulse_width; i++) {
      reflected_signal[i] = pulse[i] * reflection_coefficient
    }
  }

  const measured_signal = pulse.map((v, i) => v + reflected_signal[i])
  const travel_time_index = reflected_signal.indexOf(Math.max(...reflected_signal))
  const estimated_fault_distance = (travel_time_index * propagation_velocity) / (2 * pulse.length)

  console.log("Estimated fault distance:", estimated_fault_distance) // Debugging line

  return {
    faultDistance: estimated_fault_distance,
    faultType
  }
}

export function mapFaultToCoordinates(start, faultDistance) {
  const { x, y, z } = start
  const newCoordinates = { x, y, z: z + faultDistance }
  console.log("Mapped coordinates:", newCoordinates) // Debugging line
  return newCoordinates
}

export function calculateDistance(point1, point2) {
  const dist = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2) + Math.pow(point2.z - point1.z, 2))
  return dist
}

export function convertKeyNotnToLocObjects(notation) {
  const [x, y, z] = notation.split(",").map(Number)
  return { x, y, z }
}

export function findShortestPath(start, target, graph) {
  const startKey = `${start.x},${start.y},${start.z}`
  const targetKey = `${target.x},${target.y},${target.z}`
  console.log("startKey: " + startKey)
  console.log("targetKey: " + targetKey)
  if (!graph[startKey]) {
    console.error("Start node not found in graph")
    return null
  }

  let startNode = startKey
  let endNode = targetKey
  const distances = {}
  const prev = {}
  const pq = new PriorityQueue()

  for (let node in graph) {
    if (node === startNode) {
      distances[node] = 0
      pq.enqueue(node, 0)
    } else {
      distances[node] = Infinity
    }
    prev[node] = null
  }

  while (!pq.isEmpty()) {
    const minNode = pq.dequeue().element

    if (minNode == endNode) break

    for (let neighbor of graph[minNode]) {
      let dist = calculateDistance(convertKeyNotnToLocObjects(minNode), convertKeyNotnToLocObjects(neighbor))
      let alt = distances[minNode] + dist
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt
        prev[neighbor] = minNode
        pq.enqueue(neighbor, alt)
      }
    }
  }

  // Reconstruct the shortest path
  const path = []
  let currentNode = endNode
  while (currentNode !== null) {
    path.unshift(currentNode)
    currentNode = prev[currentNode]
  }

  // If startNode is not in the path, there is no path
  if (path[0] !== startNode) {
    console.log("Returning infinity!")
    return { distance: Infinity, path: [] }
  }

  return { distance: distances[endNode], path }
}
