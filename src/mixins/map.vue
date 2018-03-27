<script>
import bus from '../components/bus-event'
import L from 'leaflet/dist/leaflet-src.js'
import 'leaflet-editable/src/Leaflet.Editable.js'
import 'leaflet/dist/leaflet.css'
import 'leaflet-easybutton/src/easy-button.js'
import 'leaflet-easybutton/src/easy-button.css'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import 'leaflet-extra-markers/src/assets/js/leaflet.extra-markers.js'
import 'leaflet-extra-markers/src/assets/css/leaflet.extra-markers.css'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

const GEOJSON_STYLE = {
  'color': '#ff0000',
  'weight': 3,
  'opacity': 0.55
}

export default {

  beforeCreate () {
    const layer = 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD'
    const key = 'xa7stap6gtk43fw2j23ea2dr'
    this.startMarker = null
    this.layers = {
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'}),
      ign: L.tileLayer(`https://wxs.ign.fr/${key}/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg`, {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'})
    }
  },
  methods: {
    disableScrollWheelZoom () {
      this.mapObject.scrollWheelZoom.disable()
    },
    disableDragging () {
      this.mapObject.dragging.disable()
    },
    disableZoom () {
      this.mapObject.zoomControl.disable()
    },
    // return the geojson default style
    getGeojsonStyle () {
      return GEOJSON_STYLE
    },
    // set cneter of the map to specified lng, lat and zoom
    setCenterToLngAndLat (lng, lat, zoom) {
      this.mapObject.setView(new L.LatLng(lat, lng), zoom)
    },
    // add button to the map
    addButton (icon, fn) {
      return L.easyButton(icon, fn).addTo(this.mapObject)
    },
    addStartMarker (lng, lat) {
      this.startMarker = this.addMarkerWithLngLat(lng, lat)
    },
    moveStartMarker (lng, lat) {
      this.startMarker.setLatLng([lat, lng]).update()
    },
    // add cluster marker
    addClusterMarker () {
      this.clusterMarkers = L.markerClusterGroup()
      this.mapObject.addLayer(this.clusterMarkers)
    },
    resetClusterMarker () {
      this.clusterMarkers.clearLayers()
    },
    // add Marker at given lng, lat
    addMarkerWithLngLat (lng, lat) {
      let marker = L.marker(new L.LatLng(lat, lng))
      marker.addTo(this.mapObject)
      return marker
    },
    addPoi (poi) {
      const {coordinates} = poi.position
      const mrk = this.newCustomMarker(coordinates[0], coordinates[1], poi.icon)
      if (poi.caption !== '') {
        mrk.bindPopup(poi.caption)
      }
      mrk.addTo(this.mapObject)
    },
    newCustomMarker (lng, lat, icon) {
      const customMarker = L.ExtraMarkers.icon({
        icon: icon,
        markerColor: 'blue',
        shape: 'square',
        prefix: 'fa'
      })
      return L.marker([lat, lng], {icon: customMarker})
    },
    newMarker (lng, lat) {
      return L.marker(new L.LatLng(lat, lng))
    },
    addMarker (m) {
      m.addTo(this.mapObject)
    },
    addMarkerWithLngAndLatToCluster (lng, lat) {
      let marker = L.marker(new L.LatLng(lat, lng))
      this.clusterMarkers.addLayer(marker)
      return marker
    },
    fitBounds (layer) {
      this.mapObject.fitBounds(layer.getBounds())
    },
    addGeoJSON (geojson) {
      let layer = L.geoJson(geojson, {style: GEOJSON_STYLE})
      layer.addTo(this.mapObject)
      this.mapObject.fitBounds(layer.getBounds())
    },
    // load geojson to the map with cache management
    loadJSON: function (id, factor, cbk) {
      // Simplification factor
      if (!factor) {
        factor = 0
      }

      // The geojson layer
      let layer

      // let getCacheKey = function () {
      //   // http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
      //   let h = id + '-' + factor
      //   let hash = 0
      //   let i
      //   let chr
      //   let len
      //   if (h.length === 0) return hash
      //   for (i = 0, len = h.length; i < len; i++) {
      //     chr = h.charCodeAt(i)
      //     hash = ((hash << 5) - hash) + chr
      //     hash |= 0 // Convert to 32bit integer
      //   }
      //   return hash
      // }

      // Process Payload to create a Leaflet geojson layer
      // Add layer to the map and exectute callback if needed
      let processBody = function (body) {
        layer = L.geoJson(body, {style: GEOJSON_STYLE})
        layer.addTo(this.mapObject)
        layer.refId = id
        if (cbk) {
          cbk(layer, body)
        }
      }.bind(this)

      // // Check if we have already dowloaded this geojson
      // if (localStorage && localStorage.getItem(getCacheKey()) !== null) {
      //   let body = JSON.parse(localStorage.getItem(getCacheKey()))
      //   processBody(body)
      //   // console.debug('retrieving id %s from cache', id)
      //   return
      // }

      // retrieving geojson and add it to cache
      this.get('tracks/' + id + '?factor=' + factor, {headers: {Accept: 'application/vnd.geo+json'}}).then((response) => {
        // Status code is not 200
        /*
        if (response.status !== 200) {
          console.error('Error while trying to download : %d', id)
          return
        }
        */
        // localStorage available, let's put in chache
        // if (localStorage) {
        //   localStorage.setItem(getCacheKey(), JSON.stringify(response.body))
        // }
        processBody(response.body)
      }, (response) => {
        console.error('Error while trying to download : %d', id)
      })
    }
  },
  mounted () {
    let me = this
    this.mapObject = L.map('map', {
      center: [50.505, 3.36],
      layers: [this.layers.osm],
      zoom: 13,
      editable: true
    })
    L.control.layers({osm: this.layers.osm, ign: this.layers.ign}).addTo(this.mapObject)
    bus.$on('map.center', function (lng, lat, z) {
      me.setCenterToLngAndLat(lng, lat, z)
    })
  },
  destroyed () {
    bus.$off('map.center')
  }
}
</script>