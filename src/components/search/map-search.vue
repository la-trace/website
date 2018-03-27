<template>
  <!-- map -->
  <div class="columns is-gapless is-full-height">
    <div class="column is-four-fifths is-relative">
      <div id="map"></div>
      <geocode></geocode>
      <info-panel :track="selectedTrack" :displayed="paneDisplayed"></info-panel>
    </div>
    <div class="column is-grey">
      <div class="padded">
        <div class="field">
          <label class="label blank">{{ $t("search.minimal_distance") }} {{filter.km.min}} km</label>
          <vue-slider ref="slider" v-model="filter.km.min" :tooltip="false"></vue-slider>
        </div>

        <div class="field">
          <label class="label blank">{{ $t("search.maximal_distance") }} {{getMaxDistanceLabel}} km</label>
          <vue-slider ref="slider" v-model="filter.km.max" :max="200" :tooltip="false"></vue-slider>
        </div>

        <div class="field">
          <label class="label blank">{{ $t("search.maximal_elevation") }} {{getMaxElevationLabel}} m</label>
          <vue-slider ref="slider" v-model="filter.elevation" :max="3000" :tooltip="false"></vue-slider>
        </div>

        <!--div class="field">
          <label class="label blank">Activité</label>
          <p class="control">
            <span class="select">
              <select>
                <option v-for="item in options" :value="item.value">{{item.label}}</option>
              </select>
            </span>
          </p>
        </div-->

        <a class="button is-primary is-fullwidth" @click="validateFilter">{{ $t("search.confirm") }}</a>
      </div>
    </div>
  </div>
</template>
<script>
import map from '../../mixins/map'
import geocode from '../google-geocode'
import api from '../../mixins/api'
import filters from '../../mixins/filters'
import vueSlider from 'vue-slider-component'
import infoPanel from './info-panel.vue'

const CLUSTER_ZOOM_LEVEL = 12
// ∞
var getFilter = function () {
  return {
    km: {
      min: 10,
      max: 200
    },
    activity: '',
    elevation: 3000,
    sport: ''
  }
}

export default {
  components: {
    geocode,
    vueSlider,
    infoPanel
  },
  data () {
    return {
      test: 10,
      paneDisplayed: false,
      options: [
        {label: 'none', value: 'none'},
        {label: 'vtt', value: 'mtb'},
        {label: 'trail', value: 'trail'}
      ],
      filter: getFilter(),
      tracks: []
    }
  },
  mixins: [map, api, filters],
  watch: {
    selectedTrack () {
      if (!this.selectedTrack) {
        this.closePane()
      }
    },
    filter: {
      handler (val, oldVal) {
        if (val.km.min > val.km.max) {
          val.km.max = val.km.min
        }
        if (val.km.max < val.km.max) {
          val.km.max = val.km.min
        }
      },
      deep: true
    }
  },
  computed: {
    selectedTrack () {
      return this.$store.getters.searchSelectedTrack
    },
    getMaxDistanceLabel () {
      let value = this.filter.km.max
      if (this.filter.km.max === 200) {
        value = '∞'
      }
      return value
    },
    getMaxElevationLabel () {
      let value = this.filter.elevation
      if (this.filter.elevation === 3000) {
        value = '∞'
      }
      return value
    }
  },
  methods: {
    focus (id) {
      this.focused = true
      for (let i in this.layers) {
        // select layer
        let lay = this.layers[i]
        // reset style
        lay.setStyle(this.getGeojsonStyle())

        // focus style
        if (id === lay.refId) {
          lay.setStyle({color: '#00B', weight: 4})
        } else {
          lay.setStyle({opacity: 0.2})
        }
      }
      this.getTrack(id)
    },
    validateFilter () {
      this.filterDisplayed = false
      this.setAnchor()
      this.updateDisplayedTracks()
    },
    formatElevation (d) {
      let o = {}
      o.series = [[]]
      o.labels = []
      for (let i = 0; i < d.length; i++) {
        o.series[0].push(d[i][0])
        o.labels.push(d[i][1])
      }
      return o
    },
    clear () {
      for (let i in this.layers) {
        let lay = this.layers[i]
        this.mapObject.removeLayer(lay)
      }
    },
    reset () {
      for (let i in this.layers) {
        let lay = this.layers[i]
        lay.setStyle(this.getGeojsonStyle())
      }
    },
    enableZoom () {
      this.mapObject.zoomControl.enable()
      this.mapObject.touchZoom.enable()
      this.mapObject.doubleClickZoom.enable()
      this.mapObject.scrollWheelZoom.enable()
      this.mapObject.boxZoom.enable()
      this.mapObject.keyboard.enable()
    },
    disableZoom () {
      this.mapObject.zoomControl.disable()
      this.mapObject.touchZoom.disable()
      this.mapObject.doubleClickZoom.disable()
      this.mapObject.scrollWheelZoom.disable()
      this.mapObject.boxZoom.disable()
      this.mapObject.keyboard.disable()
    },
    closePane () {
      if (this.clusterMode) {
        this.clear()
      }
      this.focused = false
      this.paneDisplayed = false
      this.enableZoom()
      this.reset()
    },
    getBoundsAsQueryStringForApi () {
      let bounds = this.mapObject.getBounds()
      let ne = bounds.getNorthEast()
      let sw = bounds.getSouthWest()
      let url = 'ne_lat=' + ne.lat.toFixed(3) +
      '&ne_lon=' + ne.lng.toFixed(3) +
      '&sw_lat=' + sw.lat.toFixed(3) +
      '&sw_lon=' + sw.lng.toFixed(3) +
      '&dist_min=' + this.filter.km.min * 1000 +
      '&dist_max=' + this.filter.km.max * 1000 +
      '&ele_max=' + this.filter.elevation
      '&activity=' + this.filter.activity
      return url
    },
    addToTracks (id) {
      let me = this
      this.get('tracks/' + id).then(response => me.tracks.push(response.body))
    },
    getTrack (id) {
      let me = this
      let p = this.get('tracks/' + id).then(response => {
        me.$store.commit('setSearchSelectedTrack', response.body)
        // Display pane if needed
        if (!me.paneDisplayed) {
          me.paneDisplayed = true
        }
        me.disableZoom()
      }, response => {
        this.$toast.open({
          message: 'An error occured',
          type: 'is-success'
        })
      })
      return p
    },
    goToSelectedTrack (id) {
      this.$router.push({path: '/track/' + this.selectedTrack.id})
    },
    center (id) {
      for (let i in this.layers) {
        let lay = this.layers[i]
        if (id === lay.refId) {
          this.fitBounds(lay)
        }
      }
    },
    parseData () {
      let obj = {}
      let string = this.$route.params.data
      if (!string) {
        return obj
      }
      let datas = string.split(',')

      for (let i in datas) {
        let data = datas[i]
        let pair = data.split('=')
        if (pair.length === 2) {
          obj[pair[0]] = pair[1]
        }
      }
      return obj
    },
    setAnchor () {
      let center = this.mapObject.getCenter()
      let params = {}
      params.lat = center.lat.toFixed(4)
      params.lng = center.lng.toFixed(4)
      params.z = this.mapObject.getZoom()
      params.dist_min = this.filter.km.min
      params.dist_max = this.filter.km.max
      params.activity = this.filter.activity
      let query = []
      for (let p in params) {
        let k = p
        let v = params[p]
        query.push(k + '=' + encodeURIComponent(v))
      }
      this.$router.push({path: '/search/' + query.join(',')})
    },
    updateDisplayedTracks () {
      let url = this.getBoundsAsQueryStringForApi()
      this.getTracksInBounds(url)
    },
    displayAsMarker (query) {
      if (this.inProgress) {
        return
      }
      this.inProgress = true

      this.clear()

      this.layers = []
      this.displayed = []
      this.tracks = []

      // Reset previous cluster marker
      this.resetClusterMarker()

      let me = this

      // Get new markers to display
      this.get('tracks/intersects/centroid?' + query, {}).then((response) => {
        this.inProgress = false
        for (var i = 0; i < response.body.length; i++) {
          var a = response.body[i].point.coordinates
          let m = this.addMarkerWithLngAndLatToCluster(a[0], a[1])
          m.refId = response.body[i].id

          // on click on the marker
          m.on('click', e => {
            let id = e.target.refId
            me.getTrack(id)
            me.clear()
            me.loadJSON(id, 0.0005, function (layer) {
              me.layers.push(layer)
              me.focus(id)
            })
          })
        }
      }, response => {
        this.$toast.open({
          message: 'An error occured',
          type: 'is-danger'
        })
      })
    },
    displayAsTracks (query) {
      if (this.inProgress) {
        return
      }
      this.inProgress = true
      this.tracks = []

      this.resetClusterMarker()
      let me = this
      this.get('tracks/intersects?' + query, {}).then(response => {
        // Progress
        this.inProgress = false

        // Check if we need to remove some layers
        // Iterating over layers already displayed
        for (let i in me.layers) {
          let lay = me.layers[i]
          let needed = false

          // Iterating over the payload to see if the layer is needed
          for (let j = 0; j < response.body.length; j++) {
            if (response.body[j] === lay.refId) {
              needed = true
              break
            }
          }

          // The layer is not needed, let's removing it
          if (!needed) {
            let index = me.displayed.indexOf(lay.refId)
            if (index > -1) {
              me.displayed.splice(index, 1)
            }
            me.mapObject.removeLayer(lay)
            delete me.layers[i]
          }
        }

        // Iterating over the payload to display the new layers
        for (let i = 0; i < response.body.length; i++) {
          let id = response.body[i]

          me.addToTracks(id)

          // Check if the layer is already displayed
          // if true, skipping the http request
          if (me.displayed.indexOf(id) === -1) {
            // loadJSON to map
            me.loadJSON(id, 0.0005, function (layer) {
              // on click on track
              layer.on('click', function (e) {
                let id = e.target.refId

                // get track info
                me.getTrack(id).then(response => {
                  // focus style on current json
                  for (let i in me.layers) {
                    // select layer
                    let lay = me.layers[i]
                    // reset style
                    lay.setStyle(me.getGeojsonStyle())

                    me.focused = true

                    // focus style
                    if (id === lay.refId) {
                      lay.setStyle({color: '#00B', weight: 4})
                    } else {
                      lay.setStyle({opacity: 0.2})
                    }
                  }
                })
              })
              me.layers.push(layer)
            })
            me.displayed.push(id)
          }
        }
      }, response => {
        this.$toast.open({
          message: 'An error occured',
          type: 'is-danger'
        })
      })
    },
    switchDisplay (full) {
      // let column = document.getElementById('column')
      // let search = document.getElementById('search')

      // if (full) {
      //   let str = column.className.replace('el-col-6', 'el-col-0')
      //   column.className = str
      //   str = search.className.replace('el-col-18', 'el-col-24')
      //   search.className = str
      //   this.mapObject.invalidateSize()
      // } else {
      //   let str = column.className.replace('el-col-0', 'el-col-6')
      //   column.className = str
      //   str = search.className.replace('el-col-24', 'el-col-18')
      //   search.className = str
      //   this.mapObject.invalidateSize()
      // }
    },
    getTracksInBounds (query) {
      if (this.focused) {
        return
      }
      if (this.mapObject.getZoom() > CLUSTER_ZOOM_LEVEL) {
        this.clusterMode = false
        this.displayAsTracks(query)
        this.switchDisplay()
      } else {
        this.switchDisplay(true)
        this.displayAsMarker(query)
        this.clusterMode = true
      }
    },
    refresh () {
      this.setAnchor()
      this.updateDisplayedTracks()
    }
  },
  beforeDestroy () {
    this.mapObject.off('moveend', this.refresh)
  },
  // When Map is mounted to the DOM
  mounted () {
    let lng = 2.3950
    let lat = 48.8638
    let zoom = 12

    // parseAnchor datas
    let datas = this.parseData()

    // lng and lat form URL Anchor
    if (datas.lat && datas.lng) {
      lat = datas.lat
      lng = datas.lng
    }

    // zoom from anchor
    if (datas.z) {
      zoom = datas.z
    }

    this.focused = false

    this.clusterMode = false

    // Displayed tracks
    this.displayed = []

    // Available layers
    this.layers = []

    this.inProgress = false

    if (lat !== '' && lng !== '') {
      this.setCenterToLngAndLat(lng, lat, zoom)
    }

    // Bind Events
    this.mapObject.on('moveend', this.refresh)

    // add cluster marker
    this.addClusterMarker()

    // Display track
    this.updateDisplayedTracks()

/*
    // init chart
    this.initChart()

    var data = {
      // A labels array that can contain any sort of values
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      // Our series array that contains series objects or in this case series data arrays
      series: [
        [200, 50, 41, 10, 20]
      ]
    }

    let options = {
      height: '80px',
      width: '400px',
      low: 0,
      high: 500,
      showArea: true,
      showLine: false,
      showPoint: false,
      chartPadding: 0,
      axisX: {
        showLabel: false,
        showGrid: false
      },
      axisY: {
        showLabel: false,
        showGrid: false
      }
    }

    this.chart = new chartist.Line('.ct-chart', {}, options)
*/
  }
}
</script>
<style scoped>
  .is-full-height {
    position: fixed;
    bottom:0;
    left: 0;
    width:100%;
    height: calc(100% - 52px)!important;
  }
  .is-relative {
    position: relative
  }
  .padded {
    padding: 20px !important;
  }
  .is-grey {
    background-color: #F5F5F5;
  }
  #map {
    width: 100%;
    height: 100%;
  }
  #geocode {
    position: absolute;
    width: 300px;
    top: 30px;
    right: 10px;
    z-index: 1000;
  }

  #nprogress .bar {
    height: 4px!important;
  }
</style>