<template>
  <div>
    <div v-for="criterion in criterions">
      <b>{{criterion.name}}</b> <star-rating :increment="0.5" v-bind:star-size="30" @rating-selected ="setRating($event, criterion.name)"></star-rating>
    </div>
    <a class="button is-info" @click="save()">Continue</a>
    <a class="button is-danger" @click="reset()">Cancel</a>
  </div>
</template>
<script>
import StarRating from 'vue-star-rating'
import api from '../../mixins/api'

export default {
  mixins: [api],
  data () {
    return {
      criterions: [
        {
          name: 'technical'
        },
        {
          name: 'landscape / sight'
        }
      ]
    }
  },
  components: {
    StarRating
  },
  methods: {
    reset () {
      this.$store.commit('resetTrack')
      this.$store.setStep(0)
    },
    save (id) {
      const geojson = this.$store.getters.uploadTrackGeoJSON
      this.post('upload', geojson).then(response => {
        this.$toast.open({
          message: 'Sauvegarde OK !',
          type: 'is-success'
        })
        this.$router.push({path: '/track/' + response.body.id})
      })
    },
    next () {
      this.$store.commit('incStep')
    },
    setRating (value, n) {
      this.$store.commit('setRating', {name: n, value: value})
    }
  }
}
</script>