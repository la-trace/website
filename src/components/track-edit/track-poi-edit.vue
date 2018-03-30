<template>
  <div>
    <a class="button is-info" @click="newPoi()">{{ $t("common.new") | toTitle }}</a>
    <div id="wrapper" class="is-padded">
      <div id="map"></div>
    </div>
    <div v-if="editMode" class="is-padded">
      <div class="columns">
        <div class="column">
          <a class="button is-info is-fullwidth" @click="savePoi">{{ $t("common.save") | toTitle }}</a>
        </div>
        <div class="column">
          <a class="button is-danger is-fullwidth" @click="cancelEdit">{{ $t("common.cancel") | toTitle }}</a>
        </div>
      </div>
    </div>

    <b-modal :active.sync="modal" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ $t("track_edit.choose_icon") | toTitle }}</p>
        </header>
        <section class="modal-card-body">
          <a class="button" v-for="icon in icons" @click="selectIcon(icon)">
            <span class="icon is-small">
              <i class="fa" :class="icon"></i>
            </span>
          </a>
        </section>
      </div>
    </b-modal>

    <table class="table is-fullwidth" v-if="!editMode">
      <thead>
        <th>{{ $t("track_edit.caption") | toTitle }}</th>
        <th>{{ $t("track_edit.longitude") | toTitle }}</th>
        <th>{{ $t("track_edit.latitude") | toTitle }}</th>
        <th>{{ $t("track_edit.icon") | toTitle }}</th>
        <th>{{ $t("track_edit.actions") | toTitle }}</th>
      </thead>
      <tbody>
        <tr v-for="(poi, idx) in pois">
          <td><input class="input" type="text" placeholder="caption" v-model="poi.caption"></td>
          <td>{{poi.position.coordinates[0].toFixed(5)}}</td>
          <td>{{poi.position.coordinates[1].toFixed(5)}}</td>
          <td>
            <a class="button is-primary" @click="chooseIcon(poi.id)">Icon</a>
          </td>
          <td>
            <a class="button is-info" @click="edit(idx, poi)">{{ $t("track_edit.move") | toTitle }}</a>
            <a class="button is-info" @click="center(poi)">{{ $t("track_edit.center") | toTitle }}</a>
            <a class="button is-info" @click="updateCaption(poi)">{{ $t("track_edit.save") | toTitle }}</a>
            <a class="button is-danger" @click="deletePoi(poi.id)">{{ $t("common.delete") | toTitle }}</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import cloneDeep from 'lodash.clonedeep'
import api from '../../mixins/api'
import map from '../../mixins/map'
import Filters from '../../mixins/filters'

export default {
  props: ['trackId'],
  mixins: [api, map, Filters],
  mounted () {
    this.initMap()
    this.loadPoisAndDisplay()
  },
  data () {
    return {
      pois: [],
      currentPoi: null,
      selectedPoiId: null,
      newCreateMarker: null,
      editMode: false,
      bounds: null,
      icons: ['fa-exclamation-triangle', 'fa-eye', 'fa-arrow-left', 'fa-arrow-up', 'fa-arrow-right', 'fa-arrow-down', 'fa-minus-circle', 'fa-flag', 'fa-flag-o', 'fa-info-circle', 'fa-car', 'fa-tint', 'fa-warning'],
      modal: false
    }
  },
  methods: {
    chooseIcon (id) {
      this.selectedPoiId = id
      this.modal = true
    },
    selectIcon (value) {
      const payload = {icon: value}
      return this.patch('pois/' + this.selectedPoiId, payload).then(() => {
        this.$toast.open({
          message: 'Update Successful !',
          type: 'is-success'
        })
        this.modal = false
        this.removeMarkers()
        this.loadPoisAndDisplay()
      })
    },
    loadPoisAndDisplay () {
      this.pois = []
      this.get('tracks/' + this.trackId).then(response => {
        this.pois = response.body.pois.map(poi => {
          // create a new object from poi with a marker associated
          return {
            ...poi,
            marker: this.newCustomMarker(poi.position.coordinates[0], poi.position.coordinates[1], poi.icon)
          }
        })
        this.pois.map(poi => this.addMarker(poi.marker))
      })
    },
    initMap () {
      let me = this
      if (!this.mapInitialized) {
        document.getElementById('wrapper').style.height = '300px'
        document.getElementById('wrapper').style.width = '100%'
        // i hate this kind of shitty hack
        setTimeout(() => {
          this.mapObject.invalidateSize()
          this.loadJSON(this.trackId, 0, layer => {
            me.bounds = layer.getBounds()
            me.mapObject.fitBounds(me.bounds)
          })
        }, 100)
        this.mapInitialized = true
      }
    },
    deletePoi (id) {
      this.delete('pois/' + id).then(response => {
        this.$toast.open({
          message: 'Suppression OK !',
          type: 'is-success'
        })
        this.removeMarkers()
        this.loadPoisAndDisplay()
      })
    },
    displayMarkers () {
      this.pois.map(poi => this.addMarker(poi.marker))
    },
    removeMarkers () {
      this.pois.map(poi => this.mapObject.removeLayer(poi.marker))
    },
    upsert () {
      this.cancelEdit()
    },
    savePoi () {
      if (this.newCreateMarker) {
        const geojson = this.newCreateMarker.toGeoJSON()
        const payload = {caption: '', position: geojson.geometry}
        return this.post('tracks/' + this.trackId + '/pois', payload).then(() => {
          this.$toast.open({
            message: 'Creation Successful !',
            type: 'is-success'
          })
          this.loadPoisAndDisplay()
          this.cancelEdit()
        })
      } else {
        const poi = this.currentPoi
        const geojson = poi.marker.toGeoJSON()
        const payload = {caption: poi.caption, position: geojson.geometry}
        return this.patch('pois/' + poi.id, payload).then(() => {
          this.$toast.open({
            message: 'Update Successful !',
            type: 'is-success'
          })
          this.loadPoisAndDisplay()
          this.cancelEdit()
        })
      }
    },
    update () {
      const poi = this.currentPoi
      const geojson = poi.marker.toGeoJSON()
      const payload = {caption: poi.caption, position: geojson.geometry}
      return this.patch('pois/' + poi.id, payload)
    },
    cancelEdit () {
      this.editMode = false
      if (this.newCreateMarker) {
        this.mapObject.removeLayer(this.newCreateMarker)
      } else {
        this.mapObject.removeLayer(this.currentPoi.marker)
      }
      this.displayMarkers()
      this.mapObject.fitBounds(this.bounds)
    },
    updateCaption (poi) {
      const geojson = poi.marker.toGeoJSON()
      const payload = {caption: poi.caption, position: geojson.geometry}
      return this.patch('pois/' + poi.id, payload).then(() => {
        this.$toast.open({
          message: 'Update Successful !',
          type: 'is-success'
        })
      })
    },
    edit (idx, poi) {
      // center map
      this.center(poi)

      // remove all markers
      this.removeMarkers()

      // add edited marker
      const editablePoi = cloneDeep(poi)
      this.addMarker(editablePoi.marker)
      editablePoi.marker.dragging.enable()
      this.currentPoi = editablePoi
      this.editMode = true
    },
    center (poi) {
      this.setCenterToLngAndLat(poi.position.coordinates[0], poi.position.coordinates[1])
    },
    newPoi () {
      this.removeMarkers()
      const center = this.mapObject.getCenter()
      this.newCreateMarker = this.addMarkerWithLngLat(center.lng, center.lat)
      this.newCreateMarker.addTo(this.mapObject)
      this.newCreateMarker.dragging.enable()
      this.editMode = true
    }
  }
}
</script>
<style scoped>
  #wrapper {
    height: 0px;
    width: 100%;
  }
  .is-padded {
    padding-top: 15px;
  }
  .modal {
    z-index: 1000!important
  }
  .button {
    margin-right: 5px
  }
</style>