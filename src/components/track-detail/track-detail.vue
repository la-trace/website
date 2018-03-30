<template>
<div class="container" v-if="dataLoaded">
  <div class="modal" :class="{'is-active': modal}">
    <div class="modal-background"></div>
      <div class="modal-content">
        <p class="image is-4by3">
          <img :src="focus">
        </p>
      </div>
      <button class="modal-close" @click="toggle()"></button>
  </div>
  <nav class="level pad">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">{{ $t('track.distance') }}</p>
        <p class="title">
          {{track.distance | toKm}} km
        </p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">{{ $t('track.elevation') }}</p>
        <p class="title">{{track.elevationGain}} m</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">{{ $t('track.downloads') }}</p>
        <p class="title">{{track.downloads}}</p>
      </div>
    </div>
  </nav>
  <div class="columns">
    <div class="column is-three-quarters">
      <map-detail class="block" :pois="track.pois" :track-id="track.id"></map-detail>
      <elevation :track-id="track.id" class="block"></elevation>

      <div class="gallery">
        <a :href="picture.url" :data-caption="picture.caption" v-for="picture in track.pictures" class="thumbnail">
          <img :src="picture.thumbnail">
        </a>
      </div>

      <div id="video" v-if="track.video.length > 0">
        <iframe :src="track.video" width="100%" height="400" frameborder="0"></iframe>
      </div>
    
      <h2 v-if="track.comments.length > 0">{{ $t('track.comments') }} <span class="tag is-light">{{track.comments.length}}</span></h2>
      <article class="media" v-for="(comment, key) in track.comments">
        <figure class="media-left">
          <p class="image is-64x64">
            <img src="http://bulma.io/images/placeholders/128x128.png">
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <p>
              <strong>{{comment.user.name}}</strong> <small>{{comment.creation | formatDate}}</small>
              <br>
              {{comment.content}}
            </p>
          </div>
        </div>
      </article>
    </div>
    <div class="column">
      <div v-if="dataLoaded" class="block padded">
        <h1 class="title is-5">{{track.name}}</h1>
        <p class="content is-small">{{ $t('track.uploaded_by') }}<strong> {{track.user.name}}</strong> on {{track.creation | formatDate}}</p>
        <hr>
        <p v-html="track.description"></p>
        <hr>
        <div v-if="isOwner">
          <router-link :to="{path: '/track/edit/' + track.id}" class="button is-info is-fullwidth">{{ $t('track.edit') | toTitle }}</router-link>
          <a class="button is-danger is-fullwidth margin" @click="deleteTrack(track.id)">{{ $t('common.delete') | toTitle }}</a>
          <hr>
        </div>
        <p><strong>{{ $t('track.start') }}</strong> : {{track.startAddress.city}}</p>
        <p><strong>{{ $t('track.end') }}</strong> : {{track.endAddress.city}}</p>
        <hr>
        <div v-for="(value, key) in track.rating">
          <div class="columns">
              <div class="column">{{key}}</div>
              <div class="column" v-if="isNaN(value)">{{value}}</div>
              <div class="column" v-else>
                <star-rating :rating="parseInt(value, 10)" :star-size="20" read-only :show-rating="false"></star-rating>
              </div>
          </div>
        </div>
        <hr>
        <router-link :to="{path: getSearchLink}" class="button is-info is-fullwidth">{{ $t('track.search_around') | toTitle }}</router-link>
        <br>
        <a @click="download(track.id)" class="button is-info is-fullwidth">{{ $t('track.download') | toTitle }}</a>
        <br>
        <img :src="getImageLink">
      </div>
    </div>
  </div>
</div>
</template>

<script>
import mapDetail from '../map-detail'
import elevation from './elevation-graph'
import filters from '../../mixins/filters'
import api from '../../mixins/api'
import FileSaver from 'file-saver'
import Video from '../../services/video-link-generator'
import StarRating from 'vue-star-rating'
import BaguetteBox from 'baguettebox.js'
import 'baguettebox.js/dist/baguetteBox.css'
import auth from 'components/auth'

export default {
  mixins: [api, filters],
  data () {
    return {
      track: {
        comments: [],
        pictures: [],
        video: []
      },
      dataLoaded: false,
      focus: '',
      modal: false
    }
  },
  components: {
    mapDetail,
    elevation,
    StarRating
  },
  computed: {
    isOwner () {
      const id = auth.getUserId()
      return id === this.track.user.id
    },
    getSearchLink () {
      return `/search/lat=${this.track.startAddress.latitude},lng=${this.track.startAddress.longitude},z=13`
    },
    getImageLink () {
      return `https://maps.googleapis.com/maps/api/staticmap?center=${this.track.startAddress.latitude},${this.track.startAddress.longitude}&zoom=8&size=330x150&sensor=false&markers=color:red|label:D|${this.track.startAddress.latitude},${this.track.startAddress.longitude}`
    }
  },
  methods: {
    deleteTrack (id) {
      this.delete('tracks/' + id).then(response => {
        this.$router.push({path: '/'})
      })
    },
    loadTrackData (id) {
      let me = this
      this.get('tracks/' + id).then(response => {
        me.track = response.body
        me.track.description = response.body.description.replace(/\n/g, '<br>')
        me.track.pictures = response.body.pictures.map(el => {
          el.thumbnail = process.env.RESIZE + '200/200/' + el.url
          el.url = process.env.RESIZE + 'pics/' + el.url
          return el
        })
        if (me.track.video.length > 0) {
          let v = me.track.video[0]
          me.track.video = Video.getLink(v.platform, v.slug)
        }
        me.dataLoaded = true

        // @TODO Fix this ugly hack
        setTimeout(function () {
          BaguetteBox.run('.gallery')
        }, 100)
      })
    },
    download (id) {
      this.get('tracks/' + id, {'headers': {'Accept': 'application/gpx+xml'}}).then((response) => {
        let blob = new Blob([response.data], {type: 'application/xml'})
        FileSaver.saveAs(blob, this.track.name + '.gpx')
      })
    }
  },
  mounted () {
    let id = this.$route.params.id
    this.loadTrackData(id)
  }
}
</script>
<style scoped>
.pad {
  padding: 20px 0 5px 0
}
.margin {
  margin-top: 15px;
}
.right {
  text-align: right
}
.thumbnail {
  margin: 0 4px 0 0;
  display: inline-block;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 180px;
  width: 180px;
}
</style>