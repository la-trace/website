<template>
  <div class="container">
    <div class="steps">
      <ul class="steps-container">
          <li style="width:25%;" v-bind:class="{activated: step > 0}">
              <div class="step">
                  <div class="step-image"><span></span></div>
                  <div class="step-current">{{ $t('upload.step_1') }}</div>
                  <div class="step-description">{{ $t('upload.upload_file') | toTitle }}</div>
              </div>
          </li>
          <li style="width:25%;" v-bind:class="{activated: step > 1}">
              <div class="step">
                  <div class="step-image"><span></span></div>
                  <div class="step-current">{{ $t('upload.step_2') }}</div>
                  <div class="step-description">{{ $t('upload.add_description') | toTitle }}</div>
              </div>
          </li>
          <li style="width:25%;" v-bind:class="{activated: step > 2}">
              <div class="step">
                  <div class="step-image"><span></span></div>
                  <div class="step-current">{{ $t('upload.step_3') }}</a></div>
                  <div class="step-description">{{ $t('upload.rating') | toTitle }}</div>
              </div>
          </li>
          <li style="width:25%;" v-bind:class="{activated: step > 3}">
              <div class="step">
                  <div class="step-image"><span></span></div>
                  <div class="step-current">{{ $t('upload.step_4') }}</div>
                  <div class="step-description">{{ $t('upload.summary_and_publish') | toTitle }}</div>
            </div>
          </li>
      </ul>
      <div class="step-bar" v-bind:style="{width: 25*step + '%'}"></div>
    </div>

    <div id="wrapper" v-bind:class="{hidden: !analyzed}">
      <div id="map"></div>
    </div>

    <div v-if="step === 0">
      <div class="columns">
        <div class="column">
          <div class="notification is-danger" v-if="error">{{error}}</div>
        </div>
      </div>
      <div class="columns is-centered" >
        <div class="column is-one-quarter">
          <label for="file" class="label-file button is-primary is-large" v-bind:class="{'is-loading': processing}" id="upload-button">
            <span class="icon is-medium">
              <i class="fa fa-location-arrow"></i>
            </span>
            <span>{{ $t('upload.choose_a_gpx_file') }}</span>
          </label>
          <input type="file" id="file" class="button" @change="onFileChange">
        </div>
      </div>
    </div>

    <div id="main-upload" class="has-text-centered step-1" v-if="step === 1">
      <div class="notification is-success" v-if="analyzed">{{ $t('common.operation_successful') | toTitle }}</div>
      <table class="table is-fullwidth">
        <tbody>
          <tr>
            <td>{{ $t('upload.file') }}<br>
              <span class="is-size-7">{{ $t('upload.file_desc') | toTitle }}</span>
            </td>
            <td>{{track.info.fileName}}</td>
          <tr>
          <tr>
            <td>{{ $t('upload.number_of_points') }}<br>
              <span class="is-size-7">{{ $t('upload.number_of_points_desc') | toTitle }}</span>
            </td>
            <td>{{track.info.nbOfPoints}}</td>
          <tr>
          <tr>
            <td>{{ $t('upload.number_of_points_reduced') }} <br>
              <span class="is-size-7" v-html="$t('upload.number_of_points_reduced_desc')"></span>
            </td>
            <td>{{track.info.reducedNbOfPoints}}</td>
          </tr>
          <tr>
            <td>{{ $t('upload.distance') }}<br>
              <span class="is-size-7"></span>

            </td>
            <td>{{track.info.distance | toKm}} km</td>
          </tr>
          <tr>
            <td>{{ $t('upload.elevation_gain') }}<br>
               <span class="is-size-7" v-html="$t('upload.elevation_gain_desc')"></span>
            </td>
            <td>{{track.geojson.properties.elevationGain}} m</td>
          </tr>
          <tr>
            <td>{{ $t('upload.start_point') }}<br>
               <span class="is-size-7" v-html="$t('upload.reverse_geocoding_desc')"></span>
            </td>
            <td><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw" v-if="startPoint === ''"></i> {{startPoint}}</td>
          </tr>
           <tr>
            <td>{{ $t('upload.end_point') }}<br>
                <span class="is-size-7" v-html="$t('upload.reverse_geocoding_desc')"></span>
            </td>
            <td><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"  v-if="endPoint === ''"></i> {{endPoint}}</td>
          </tr>
        </tbody>
      </table>
      <p></p>
    </div>

    <div class="step-2" v-if="step === 2" style="margin-bottom:1.5rem">
      <titled></titled>
    </div>

    <div class="step-3" v-if="step === 3">
      <rating></rating>
    </div>

    <div class="step-4" v-if="step === 4">
      <table class="table is-fullwidth">
        <tbody>
          <tr>
            <td>{{ $t('upload.name') }}</td>
            <td>{{track.geojson.properties.name}}</td>
          </tr>
          <tr>
            <td>{{ $t('upload.description') }}</td>
            <td>{{track.geojson.properties.description}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="columns is-centered" v-if="step > 0">
        <div class="column is-one-quarter">
          <a class="button is-info is-fullwidth" @click="next()" v-if="step < 4" :disabled="cantContinue">{{ $t('upload.continue') | toTitle }}</a>
          <a class="button is-info is-fullwidth" @click="save()" v-else>{{ $t('common.save') | toTitle }}</a>
        </div>
        <div class="column is-one-quarter">
          <a class="button is-danger is-fullwidth" @click="reset()">{{ $t('upload.cancel') | toTitle }}</a>
        </div>
    </div>
  </div>

</template>

<script>
import simplify from 'simplify-geojson/index.js'
import haversine from '../../services/haversine'
import filters from '../../mixins/filters'
import map from '../../mixins/map'
import titled from './title-and-desc'
import rating from './rating'
import api from '../../mixins/api'
import ReverseGeocoding from '../../mixins/reverse-geocoding'

const movingAverageWithWindow = (numberOfPoints) => {
  return (el, index, array) => {
    const center = Math.floor(numberOfPoints / 2)
    const lowerBound = index - center
    let upperBound = index + center + 1
    if (index < center) {
      return el
    }
    if (upperBound > array.length) {
      upperBound = array.length
    }
    let acc = 0
    const windowing = array.slice(lowerBound, upperBound)
    for (const ele of windowing) {
      acc += ele
    }
    return acc / numberOfPoints
  }
}

const computeElevationGain = (accumulator, current, index, array) => {
  if (index === 0) {
    return 0
  }
  const currentValue = array[index]
  const previousValue = array[index - 1]
  const delta = currentValue - previousValue
  // Take only positive and greather than zero
  if (delta > 0) {
    accumulator += delta
  }
  return accumulator
}

const getElevationGain = (geojson, numberOfPoints) => {
  return Math.round(geojson.geometry.coordinates
    .map(x => x[2])
    .map(movingAverageWithWindow(numberOfPoints))
    .reduce(computeElevationGain))
}

const convertWayPointAsGeoJSONPoint = wpt => {
  let eleArray = wpt.getElementsByTagName('ele')
  let ele = '0'
  if (eleArray.length > 0) {
    ele = eleArray[0].innerHTML
  }
  return [Number(wpt.getAttribute('lon')), Number(wpt.getAttribute('lat')), Number(ele)]
}

export default {
  mixins: [filters, api, map, ReverseGeocoding],
  computed: {
    step () {
      return this.$store.getters.step
    },
    track () {
      return this.$store.getters.uploadTrack
    },
    cantContinue () {
      return this.$store.getters.cantContinue
    },
    endPoint () {
      return this.setDisplayName(this.track.geojson.properties.endPoint)
    },
    startPoint () {
      return this.setDisplayName(this.track.geojson.properties.startPoint)
    }
  },
  components: {
    titled,
    rating
  },
  mounted () {
    if (this.track.validatedStep > 0) {
      this.initMap()
      this.analyzed = true
      this.addGeoJSON(this.track.geojson)
    }
  },
  data () {
    return {
      error: null,
      analyzed: false,
      processing: false,
      numberOfPoints: 5,
      status: {
        parsed: false,
        geojson: false,
        simplify: false
      }
    }
  },
  methods: {
    initMap () {
      this.disableScrollWheelZoom()
      this.disableDragging()
      this.disableZoom()
    },
    save (id) {
      const geojson = this.$store.getters.uploadTrackGeoJSON
      this.post('upload', geojson).then(response => {
        this.$toast.open({
          message: 'Sauvegarde OK !',
          type: 'is-success'
        })
        this.$router.push({path: '/track/' + response.body.id})
        this.reset()
      })
    },
    linkDisabled (s) {
      return this.$store.getters.validatedStep < s
    },
    next () {
      this.$store.commit('incStep')
    },
    setStep (v) {
      if (this.$store.getters.validatedStep >= v) {
        this.$store.commit('setStep', v)
      } else {
        // @TODO Handling in a better way
        console.log('not allowed')
      }
    },
    reset () {
      this.parsed = false
      this.analyzed = false
      this.success = false
      this.processing = false
      this.$store.commit('resetTrack')
    },
    onFileChange (e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return
      }
      this.processFile(files[0])
    },
    reverseGeocodingPoints (coordinates) {
      const me = this
      const fp = coordinates[0]
      const length = coordinates.length
      const lp = coordinates[length - 1]

      this.reverseGeocoding(fp[0], fp[1]).then(d => {
        me.$store.commit('setStartPoint', d.raw)
      })
      this.reverseGeocoding(lp[0], lp[1]).then(d => {
        me.$store.commit('setEndPoint', d.raw)
      })
    },
    processFile (file) {
      const me = this
      let reader = new FileReader()
      this.processing = true
      reader.readAsText(file)

      reader.onload = e => {
        // parse gpx
        const result = e.target.result
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(result, 'text/xml')
        const tracks = Array.from(xmlDoc.getElementsByTagName('trk'))

        if (tracks.length === 0) {
          this.error = 'Can not find any track data in your gpx file'
          this.processing = false
          return
        }

        // reduce tracks as segments
        let segments = tracks.reduce(function (previous, current) {
          let trkseg = Array.from(current.getElementsByTagName('trkseg'))
          return previous.concat(trkseg)
        }, [])

        // reduce segments as points
        let points = segments.reduce(function (previous, current) {
          let trkpt = Array.from(current.getElementsByTagName('trkpt'))
          return previous.concat(trkpt)
        }, [])

        // convert points as GeoJSON points
        let rawCoordinates = points.map(convertWayPointAsGeoJSONPoint)
        this.$store.commit('setTrackCoordinates', rawCoordinates)

        // reverse geocoding
        this.reverseGeocodingPoints(rawCoordinates)

        const geojson = this.$store.getters.uploadTrackGeoJSON

        // compute elevation gain
        const elevationGain = getElevationGain(geojson, me.numberOfPoints)

        // Simplify tracks
        const simplifiedGeojson = simplify(geojson, 0.00005)

        // compute distance
        const distance = haversine(geojson)

        // update display
        me.analyzed = true
        me.processing = false

        me.$store.commit('setTrackInfo', {key: 'reducedNbOfPoints', value: simplifiedGeojson.geometry.coordinates.length})
        me.$store.commit('setTrackInfo', {key: 'nbOfPoints', value: rawCoordinates.length})
        me.$store.commit('setElevationGain', elevationGain)
        me.$store.commit('setTrackInfo', {key: 'fileName', value: file.name})
        me.$store.commit('setTrackInfo', {key: 'distance', value: distance})

        // init map
        me.initMap()

        // display geoJSON
        me.addGeoJSON(simplifiedGeojson)

        me.next()
        me.$store.commit('setStepOK')
      }
    }
  }
}
</script>

<style scoped>
.label-file {
  cursor: pointer;
  color: #00b1ca;
  font-weight: bold;
}
.label-file:hover {
  color: #25a5c4;
}
#file {
  display: none;
}
#wrapper {
  height: 200px;
  margin-bottom: 20px;
}
</style>
<style lang="scss" scoped>
  @import './progress.scss'
</style>