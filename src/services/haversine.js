import haversine from 'haversine'

export default function name (geojson) {
  return geojson.geometry.coordinates.reduce(function (sum, current, index, array) {
    if (index === 0) return 0
    let previous = array[index - 1]
    let currentPoint = {longitude: current[0], latitude: current[1]}
    let previousPoint = {longitude: previous[0], latitude: previous[1]}
    let value = haversine(currentPoint, previousPoint, {unit: 'meter'})
    return sum + value
  }, 0)
}
