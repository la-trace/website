<template>
  <table class="table is-fullwidth">
    <tbody>
      <tr v-for="criterion in criterions">
        <td>{{criterion.name}}</td>
        <td>
          <star-rating
            :increment="0.5"
            v-bind:star-size="30"
            :show-rating="false"
            :rating="getFromStorage(criterion.name)"
            v-if="criterion.type === 'star'"
            @rating-selected ="setRating($event, criterion.name)">
          </star-rating>
          <div class="field" v-if="criterion.type === 'enum'">
            <div class="control">
              <div class="select">
                <select @change="setRating($event.target.value, criterion.name)">
                  <option name="criterion" v-for="value in criterion.values" :selected="getFromStorage(criterion.name) === value">
                    {{value}}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script>
import StarRating from 'vue-star-rating'
import api from '../../mixins/api'
import {criterions} from '../../services/criterions'

export default {
  mixins: [api],
  data () {
    return {
      criterions: criterions
    }
  },
  components: {
    StarRating
  },
  mounted () {
    this.$store.commit('setStepOK')
  },
  methods: {
    getFromStorage (name) {
      const geojson = this.$store.getters.uploadTrackGeoJSON
      if (geojson.properties.rating[name]) {
        return geojson.properties.rating[name]
      }
    },
    setRating (value, n) {
      this.$store.commit('setRating', {name: n, value: value})
    }
  }
}
</script>