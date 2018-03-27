<script>
import Vue from 'vue'
import api from '../mixins/api'
import jwtDecode from 'jwt-decode'

const TOKEN_KEY = 'token'

export default new Vue({
  mixins: [api],
  data () {
    return {
      'logged': false
    }
  },
  methods: {
    getJWT: () => window.localStorage.getItem(TOKEN_KEY).token,
    isLogged () {
      return this.logged
    },
    getUserId () {
      const data = window.localStorage.getItem(TOKEN_KEY)
      if (data) {
        const jwt = JSON.parse(data)
        return jwt.userId
      }
    },
    init () {
      let info = window.localStorage.getItem(TOKEN_KEY)
      if (info) {
        this.logged = true
      } else {
        this.logged = false
      }
    },
    signOut () {
      window.localStorage.removeItem(TOKEN_KEY)
      this.logged = false
    },
    signIn (login, password) {
      return this.post('login', {login: login, password: password}).then(response => {
        if (response.status === 200) {
          this.logged = true
          const jwtData = jwtDecode(response.data.token)
          const data = {token: response.data.token, userId: jwtData.userId, expiredAt: jwtData.expiredAt}
          // const d = new Date(jwtData.expiredAt * 1000)
          window.localStorage.setItem(TOKEN_KEY, JSON.stringify(data))
        }
        return response
      })
    }
  }
})
</script>