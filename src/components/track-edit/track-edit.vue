<template>
  <div class="container">
    <div class="tabs">
      <ul>
        <li @click="setTab(1)"><a>{{ $t("track_edit.description") | toTitle }}</a></li>
        <li @click="setTab(2)"><a>{{ $t("track_edit.pictures") | toTitle }}</a></li>
        <li @click="setTab(3)"><a>{{ $t("track_edit.video") | toTitle }}</a></li>
        <li @click="setTab(4)"><a>{{ $t("track_edit.rating")| toTitle }}</a></li>
        <li @click="setTab(5)"><a>{{ $t("track_edit.pois") | toTitle }}</a></li>
        <li><a :href="'#/track/' + id">{{ $t("track_edit.back") | toTitle }}</a></li>
      </ul>
    </div>

    <div id="tab-1" v-if="tab===1">
      <div class="field">
        <label class="label">{{ $t("track_edit.name") | toTitle }}</label>
        <p class="control">
          <input class="input" type="text" placeholder="Normal input" v-model="track.name">
        </p>
      </div>
      <div class="field">
        <label class="label">{{ $t("track_edit.description") | toTitle }}</label>
        <p class="control">
          <textarea class="textarea" placeholder="Normal textarea" rows="10" v-model="track.description"></textarea>
        </p>
      </div>
      <a class="button is-info" @click="save(track.id)">{{ $t("common.save") | toTitle }}</a>
    </div>

    <div id="tab-2" v-if="tab===2">
      <track-pictures :id="track.id"></track-pictures>
    </div>

    <div id="tab-3" v-if="tab===3">
      <track-video :id="track.id"></track-video>
    </div>

    <div id="tab-3" v-if="tab===4">
      <track-rating :id="track.id"></track-rating>
    </div>

    <div id="tab-5" v-if="tab===5">
      <pois-edit :trackId="track.id"></pois-edit>
    </div>
  </div>
</template>

<script>
import api from '../../mixins/api'
import TrackPictures from './track-pictures'
import PoisEdit from './track-poi-edit'
import TrackVideo from './track-video'
import TrackRating from './track-rating'
import Filters from '../../mixins/filters'

export default {
  mixins: [api, Filters],
  data () {
    return {
      id: null,
      tab: 1,
      mapInitialized: false,
      track: {},
      dataLoaded: false
    }
  },
  components: {
    PoisEdit,
    TrackPictures,
    TrackVideo,
    TrackRating
  },
  methods: {
    upload () {
      var formData = new FormData()
      formData.append('file', document.getElementById('pix').files[0])
      this.post('tracks/' + this.$route.params.id + '/pictures', formData)
      this.loadTrackData(this.$route.params.id)
    },
    setTab (n) {
      this.tab = n
    },
    save (id) {
      const payload = {name: this.track.name, description: this.track.description}
      this.patch('tracks/' + id, payload).then(response => {
        this.$toast.open({
          message: 'Sauvegarde OK !',
          type: 'is-success'
        })
      })
    },
    loadTrackData (id) {
      this.id = id
      let me = this
      this.get('tracks/' + id, {}).then(response => {
        me.track = response.body
        if (me.track.video.length > 0) {
          let v = me.track.video[0]
          me.track.video = v
        }
        me.dataLoaded = true
      })
    }
  },
  mounted () {
    let id = this.$route.params.id
    this.currentTrackId = id
    this.loadTrackData(id)
  }
}
</script>