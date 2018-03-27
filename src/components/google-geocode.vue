<template>
  <div id="geocode">
    <input class="input" type="text" placeholder="Enter name of a city" v-model="city">
    <ul>
      <li v-for="item in items" v-on:click="center(item.lng, item.lat)">{{item.name}}</li>
    </ul>
  </div>
</template>

<script>
import debounce from 'debounce'
import bus from './bus-event'
import api from '../mixins/api'

export default {
  mixins: [api],
  data () {
    return {
      city: '',
      items: []
    }
  },
  watch: {
    city (v) {
      if (v !== '') {
        this.fetchData()
      }
    }
  },
  methods: {
    center (lng, lat) {
      bus.$emit('map.center', lng, lat, 12)
      this.city = ''
      this.items = []
    },
    fetchData: debounce(function () {
      this.items = []
      let items = this.items
      let url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(this.city) + '&sensor=false'
      this.$http.get(url).then(response => {
        if (response.body) {
          for (let i in response.body.results) {
            let obj = response.body.results[i]
            if (obj.types[0] !== 'locality') {
              // continue
            }
            items.push({
              name: obj.address_components[0].long_name,
              adminName1: obj.address_components[2].long_name,
              lng: obj.geometry.location.lng,
              lat: obj.geometry.location.lat
            })
          }
        }
      }, (response) => {
      })
    }, 200)
  }
}
</script>
<style scoped>
  ul {
    background-color: #FFF;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  ul li {
    background-color: #FFF;
    padding: 8px;
  }
</style>