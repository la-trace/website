<template>
  <div>
    <div id="background">
      <div class="columns is-centered">
        <div class="column is-half search">
          <b-autocomplete
              v-model="search"
              size="is-large"
              :data="results"
              :placeholder="$t('home.search_by_keyword')"
              @input="query"
              icon="search is-small"
              icon-pack="fa"
              @select="option => selected(option)">
              <template slot-scope="props">
                <div class="media">
                  <div class="media-content">
                    {{ props.option.name }}
                  </div>
                </div>
              </template>
          </b-autocomplete>
        </b-field>
        </div>
      </div>
    </div>

    <div>
      <div class="container baseline">{{ $t('home.baseline') }}</div>
    </div>
    <!-- <video
      poster=""
      id="bgvid"
      playsinline
      autoplay
      muted
      loop
    >
      <source src="http://ak7.picdn.net/shutterstock/videos/8389087/preview/stock-footage-mountain-biker-downhill-with-mtb-in-k-slow-motion-on-forest-trail-kicking-up-dirt.mp4">
    </video> -->

  <SiteFooter></SiteFooter>
  </div>
</template>

<script>
import filters from '../../mixins/filters'
import api from '../../mixins/api'
import SiteFooter from './footer'
import debounce from 'lodash/debounce'

export default {
  components: {
    SiteFooter
  },
  mixins: [filters, api],
  data () {
    return {
      search: '',
      results: []
    }
  },
  methods: {
    selected (track) {
      if (track) {
        this.$router.push({path: '/track/' + track.id})
      }
    },
    query: debounce(function () {
      const params = {q: this.search}
      this.get('search', {params: params}).then(resp => {
        let data = resp.data
        this.results = data
      })
    }, 400)
  }
}
</script>
<style scoped>
#background {
  height: 500px;
  background: url(../../assets/vtt-1.jpg) no-repeat center center fixed;
  background-size: cover;
}

.search {
  margin-top:150px
}



.baseline {
  padding: 2rem 0;
  margin-bottom: 1rem;
}
/* video {
    position: fixed;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: -100;
    transform: translateX(-50%) translateY(-50%);
    background-size: cover;
    transition: 1s opacity;
}
*/

#search {
  padding-top: 200px;
}

#home-search-results {
  background: rgba(256,256,256,0.7);
  padding: 50px;
}
</style>