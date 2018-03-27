<template>
  <div>
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
                    <option name="criterion" v-if="criterion.values" v-for="value in criterion.values" :selected="getFromStorage(criterion.name) === value">{{value}}</option>
                  </select>
                </div>
              </div>
            </div>

          </td>  

        </tr>
      </tbody>
    </table>

    <div class="columns is-centered">
      <div class="column is-half">
        <a class="button is-info is-fullwidth" @click="save">Sauvegarder</a>
      </div>
    </div>
  </div>
</template>
<script>
import StarRating from 'vue-star-rating'
import api from '../../mixins/api'
import {criterions} from '../../services/criterions'

export default {
  props: ['id'],
  mixins: [api],
  data () {
    return {
      rating: {},
      criterions: criterions
    }
  },
  components: {
    StarRating
  },
  mounted () {
    this.loadData()
  },
  methods: {
    getValues (c) {
      if (c.data && c.data.values) {
        // console.log('c', c)
        return c.data.values
      }
    },
    displayedOption (c) {
      console.log(c)
      if (c.dependsOn) {
        const d = this.getFromStorage(c.dependsOn)
        console.log('val', d)
      } else {
        return false
      }
    },
    loadData () {
      this.get('tracks/' + this.id).then(response => {
        this.rating = response.body.rating
      })
    },
    save () {
      this.patch('tracks/' + this.id, {rating: this.rating}).then(response => {
        this.$toast.open({
          message: 'Update Successful !',
          type: 'is-success'
        })
      })
    },
    getFromStorage (name) {
      if (this.rating[name]) {
        return this.rating[name]
      }
    },
    setRating (value, n) {
      this.rating[n] = value
    }
  }
}
</script>
