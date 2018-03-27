<template>
  <div id="editor-wrapper">
    <div id="distance">{{distance | toKm}} km</div>
    <div id="map"></div>
  </div>
</template>

<script>
import map from '../mixins/map'
import togpx from 'togpx'
import FileSaver from 'file-saver'
import haversine from '../services/haversine'
import filters from '../mixins/filters'

export default {
  data () {
    return {
      shape: null,
      distance: 0
    }
  },
  mixins: [map, filters],
  methods: {
    export () {
      let xml = togpx(this.shape.toGeoJSON())
      let blob = new Blob([xml], {type: 'application/xml'})
      FileSaver.saveAs(blob, 'my-track.gpx')
    },
    calculate () {
      this.distance = haversine(this.shape.toGeoJSON())
    }
  },
  mounted () {
    let me = this
    this.shape = this.mapObject.editTools.startPolyline()
    this.mapObject.on('editable:vertex:ctrlclick editable:vertex:metakeyclick', function (e) {
      e.vertex.continue()
    })
    this.mapObject.on('editable:drawing:end editable:vertex:dragend editable:vertex:deleted', function (e) {
      me.calculate()
    })

    this.filterButton = this.addButton('fa-floppy-o', function () {
      me.export()
    })
  }
}
</script>
<style type="text/css">
  #editor-wrapper {
    height: 800px;
    width: 100%;
  }
  #distance {
    position: absolute;
    width: 200px;
    height: 50px;
    line-height: 50px;
    z-index: 2000;
    top: 60px;
    right: 0px;
    background: #333;
    color: #FFF;
    padding-left: 10px;
  }
</style>