<template>
  <div id="wrapper">
    <div id="map"></div>
  </div>
</template>

<script>
import api from '../mixins/api'
import map from '../mixins/map'
import bus from './bus-event'

export default {
  props: ['trackId', 'pois'],
  mixins: [api, map],
  methods: {
    addMarker (lng, lat) {
      this.addStartMarker(lng, lat)
    },
    moveMarker (lng, lat) {
      this.moveStartMarker(lng, lat)
    }
  },
  mounted () {
    this.pois.map(poi => this.addPoi(poi))
    this.loadJSON(this.trackId, 0, (layer, body) => {
      const {coordinates} = body
      this.addStartMarker(coordinates[0][0], coordinates[0][1])
      this.mapObject.fitBounds(layer.getBounds())
    })
  },
  created () {
    bus.$on('map.movemarker', this.moveMarker)
  },
  beforeDestroy () {
    bus.$on('map.movemarker', this.moveMarker)
  }
}
</script>
<style scoped>
  #wrapper {
    height: 400px;
    width: 100%;
  }
</style>