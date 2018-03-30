<template>
  <div>
    <div class="field" v-if="!videoURL">
      <input class="input is-large" type="text" :placeholder="$t('track_edit.copy_video_url') | toTitle " v-model="link">
      <div class="notification is-danger margin" v-if="error.length > 0">{{error}}</div>
    </div>
    <div v-else>
      <div class="columns is-centered">
        <div class="column is-half">
          <p><a :href="videoURL">{{videoURL}}</a></p>
          <iframe :src="videoURL" width="100%" height="400" frameborder="0" class="margin"></iframe>
          <a class="button is-danger is-fullwidth" @click="deleteVideo()">{{ $t('common.delete') | toTitle }}</a>
        </div>
      </div> 
    </div>
  </div>
</template>

<script>
import api from '../../mixins/api'
import Parser from 'js-video-url-parser'
import Video from '../../services/video-link-generator'
import Filters from '../../mixins/filters'

const providers = ['vimeo', 'youtube']

export default {
  mixins: [api, Filters],
  props: ['id'],
  data () {
    return {
      error: '',
      video: {
        platform: '',
        id: ''
      },
      link: '',
      videoURL: null
    }
  },
  mounted () {
    this.loadData()
  },
  watch: {
    link (value) {
      const data = Parser.parse(value)
      if (data) {
        if (providers.includes(data.provider)) {
          this.video.platform = data.provider
          this.video.id = data.id
          this.videoURL = Video.getLink(this.video.platform, this.video.id)
          this.error = ''
          this.link = ''
          this.post('tracks/' + this.id + '/video', {platform: data.provider, slug: data.id}).then(response => {
            this.$toast.open({
              message: 'Operation successful',
              type: 'is-success'
            })
          })
        }
      } else {
        this.error = 'Error while parsing the URL'
      }
    }
  },
  methods: {
    parse (link) {
      Parser.parse(link)
    },
    deleteVideo () {
      this.delete('tracks/' + this.id + '/video').then(response => {
        this.videoURL = ''
        this.error = ''
        this.$toast.open({
          message: 'Operation successful',
          type: 'is-success'
        })
      })
    },
    loadData () {
      this.get('tracks/' + this.id).then(response => {
        const video = response.body.video
        if (video.length > 0) {
          const v = video[0]
          const url = Video.getLink(v.platform, v.slug)
          this.videoURL = url
        } else {
          console.log('no video')
        }
      })
    }
  }
}
</script>
<style scoped>
  .margin {
    margin-top:15px
  }
</style>