<template>
  <div class="wrapper">
    <div class="container">
      <div class="columns">

          <div class="column">
            <ul>
                <li><a href="/">{{ $t("footer.home") }}</a></li>
                <li><a href="#/login">{{ $t("footer.login") }}</a></li>
            </ul>
            <hr />
            <ul>
                <li><a href="http://twitter.com/latracepointcom" target="_blank" class="twitter">Twitter</a></li>
                <li><a href="http://www.facebook.com/pages/Latrace/146955245363923" class="facebook" target="_blank">Facebook</a></li>
            </ul>
            <hr />
            <ul class="tSmall">
                <li><a href="http://fr.wikipedia.org/wiki/GPX_(format_de_fichier)" target="_blank" class="tSmall">Description du format GPX</a></li>
                <li><a href="http://www.topografix.com/gpx.asp" target="_blank" class="tSmall">GPX : le site officiel</a></li>
                <li><a href="http://www.gpsbabel.org/" target="_blank" class="tSmall">GPSBabel : un outil indispensable</a></li>
            </ul>
            <hr />
            <ul class="tSmall">
                <li>Version: {{version}}</li>
            </ul>
          </div>

          <div class="column">
             <article class="media is-size-6" v-for="track in lastTracks">
              <figure class="media-left">
                <p class="image is-32x32">
                  <img src="../../assets/map-32.png">
                </p>
              </figure>
              <div class="media-content">
                <div class="content">
                  <router-link :to="{path: '/track/' + track.id}">
                    {{track.name}} <br> {{track.distance | toKm}} km {{track.elevationGain}} m
                  </router-link>
                </div>
              </div>
            </article>
          </div>

          <div class="column">
            <div class="field">
              <div class="control has-icons-left has-icons-right">
                <input class="input" type="email" placeholder="email" v-model="email" v-bind:class="{'is-danger': emailInvalid}">
                <span class="icon is-small is-left">
                  <i class="fa fa-envelope"></i>
                </span>
                <span class="icon is-small is-right" v-if="emailValid">
                  <i class="fa fa-check"></i>
                </span>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <textarea class="textarea" :placeholder="$t('footer.your_message')"  v-model="message"></textarea>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <button class="button is-primary" @click="contact()">{{ $t("footer.send_message") }}</button>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>
<script>
import api from '../../mixins/api'
import filters from '../../mixins/filters'
import {validateEmail} from '../../services/email-validator'

export default {
  mixins: [api, filters],
  data () {
    return {
      email: '',
      message: '',
      version: process.env.COMMIT,
      lastTracks: []
    }
  },
  computed: {
    emailValid () {
      return !this.emailInvalid
    },
    emailInvalid () {
      return this.email.length > 0 && !validateEmail(this.email)
    }
  },
  mounted () {
    this.get('/last').then(data => {
      this.lastTracks = data.body
    })
  },
  methods: {
    contact () {
      const payload = {email: this.email, content: this.email}
      this.post('contact', payload).then(data => {
        this.email = ''
        this.message = ''
        this.$toast.open({
          message: this.$i18n.t('footer.message_sent'),
          type: 'is-success'
        })
      }, data => {
        this.$toast.open({
          message: this.$i18n.t('common.error_occured'),
          type: 'is-danger'
        })
      })
    }
  }
}
</script>
<style scoped>
  .media {
    border: none!important;
    padding-top: 0.5rem!important;
    margin-top: 0rem!important;
  }
  .content {
    color: #FFF!important;
  }
  .wrapper {
    background-color: #192532;
    padding: 20px 0;
    color: #FFF;
    min-height: 400px;
  }
  a, a:hover {
    color: #FFF;
  }
</style>