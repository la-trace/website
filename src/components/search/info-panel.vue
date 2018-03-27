<template>
 <div id="pane" v-bind:class="{'slide-out': !displayed}">
<div class="level-item has-text-centered"> {{info}}
  <a class="button is-primary" @click="goToSelectedTrack()">
  <span class="icon is-small">
      <i class="fa fa-search"></i>
  </span>
  <span>{{ $t("search.detail") }}</span>
  </a>

  <a class="button is-danger" @click="closePane">
  <span class="icon is-small">
      <i class="fa fa-times"></i>
  </span>
  <span>{{ $t("search.cancel") }}</span>
  </a>
</div>
</div>
</template>
<script>
import filters from '../../mixins/filters'
export default {
  mixins: [filters],
  props: ['track', 'displayed'],
  computed: {
    info () {
      if (!this.track) return
      return `${this.track.name} - ${this.$options.filters.toKm(this.track.distance)} km / ${this.track.elevationGain} m d+`
    }
  },
  methods: {
    closePane () {
      this.$store.commit('cancelSearchSelectedTrack')
      this.displayed = false
    },
    goToSelectedTrack (id) {
      this.$router.push({path: '/track/' + this.track.id})
    }
  }
}
</script>
<style scoped>
  #pane .button {
    margin-left: 10px
  }
  #pane {
    position: absolute;
    bottom: 0px;
    height: 60px;
    width: 100%;
    line-height: 60px;
    background-color: rgba(0,0,0,0.75);
    z-index: 1000;
    transition: transform 0.3s;
    color: #FFF;
  }
  #pane.slide-out {
    transform: translateY(58px)
  }

</style>