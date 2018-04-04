import 'element-ui/lib/theme-default/index.css'
import './css/main.css'
import './css/nprogress.css'

import Vue from 'vue'
import VueRouter from 'vue-router'
import VueHighcharts from 'vue-highcharts'
import VueResource from 'vue-resource'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import browserLanguage from 'in-browser-language'

import Buefy from 'buefy'
import 'buefy/lib/buefy.css'

import search from 'components/search/map-search'
import home from 'components/home/home'
import trackDetail from 'components/track-detail/track-detail'
import TrackEdit from 'components/track-edit/track-edit'
import traxeditor from 'components/trax-editor'
import upload from 'components/upload/upload'
import login from 'components/login/login'
import auth from 'components/auth'
import register from 'components/register/register'
import './scss/main.scss'

import {messages} from './languages/ressources.js'
import Filters from './mixins/filters'

Vue.use(VueRouter)
Vue.use(VueHighcharts)
Vue.use(VueResource)
Vue.use(Buefy)
Vue.use(Vuex)
Vue.use(VueI18n)

const routes = [
  { path: '/', component: home },
  { path: '/home', component: home },
  { path: '/search/:data?', component: search },
  { path: '/track/:id', component: trackDetail },
  { path: '/track/edit/:id', component: TrackEdit },
  { path: '/upload', component: upload },
  { path: '/login', component: login },
  { path: '/prepare', component: traxeditor },
  { path: '/register', component: register }
 // { path: '/elevation', component: elevation }
]

const router = new VueRouter({
  routes
})

auth.init()

const geojson = () => {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: []
    },
    properties: {
      'description': '',
      'name': '',
      'rating': {},
      'elevationGain': 0,
      'startPoint': null,
      'endPoint': null
    }
  }
}

const i18n = new VueI18n({
  locale: browserLanguage.first(), // set locale
  fallbackLocale: 'en',
  messages // set locale messages
})

const store = new Vuex.Store({
  state: {
    search: {
      selectedTrack: null
    },
    track: {
      cantContinue: true,
      validatedStep: 0,
      currentStep: 0,
      info: {},
      geojson: geojson()
    }
  },
  getters: {
    step: state => state.track.currentStep,
    validatedStep: state => state.track.validatedStep,
    uploadTrackGeoJSON: state => state.track.geojson,
    uploadTrack: state => state.track,
    uploadTrackInfo: state => state.track.info,
    cantContinue: state => state.track.cantContinue,

    // search
    searchSelectedTrack: state => state.search.selectedTrack
  },
  mutations: {
    incStep: state => {
      state.track.currentStep = state.track.currentStep + 1
      if (state.track.currentStep > state.track.validatedStep) {
        state.track.validatedStep = state.track.currentStep
      }
      state.track.cantContinue = true
    },
    setStep: (state, v) => {
      state.track.currentStep = v
    },
    setTrackCoordinates: (state, payload) => {
      state.track.geojson.geometry.coordinates = payload
    },
    setTrackName: (state, payload) => {
      state.track.geojson.properties.name = payload
    },
    setTrackDescription: (state, payload) => {
      state.track.geojson.properties.description = payload
    },
    resetTrack: state => {
      state.track.validatedStep = 0
      state.track.currentStep = 0
      state.track.geojson = geojson()
    },
    setRating: (state, rating) => {
      state.track.geojson.properties.rating[rating.name] = rating.value
    },
    setStartPoint: (state, startPoint) => {
      state.track.geojson.properties.startPoint = startPoint
    },
    setEndPoint: (state, endPoint) => {
      state.track.geojson.properties.endPoint = endPoint
    },
    setElevationGain: (state, ele) => {
      state.track.geojson.properties.elevationGain = ele
    },
    setTrackInfo: (state, obj) => {
      state.track.info[obj.key] = obj.value
    },
    setStepOK: (state) => {
      state.track.cantContinue = false
    },
    setStepNok: (state) => {
      state.track.cantContinue = true
    },

    // search
    setSearchSelectedTrack: (state, track) => {
      state.search.selectedTrack = track
    },
    cancelSearchSelectedTrack: state => {
      state.search.selectedTrack = null
    }
  }
})

new Vue({
  i18n,
  router,
  mixins: [Filters],
  data () {
    return {
    }
  },
  methods: {
    signOut () {
      auth.signOut()
      this.$router.push({path: '/'})
    },
    isLogged () {
      return auth.isLogged()
    },
    isNotLogged () {
      return !auth.isLogged()
    }
  },
  store: store
}
).$mount('#app')
