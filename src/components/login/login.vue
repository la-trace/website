<template>
  <div class="container">
    <div class="columns is-centered margin">
      <div class="column is-three-quarters">
        <div class="notification is-danger" v-if="error">{{error}}</div>
        <div class="field">
          <p class="control has-icons-left">
            <input class="input" type="email" placeholder="Email" v-model="login">
            <span class="icon is-small is-left">
              <i class="fa fa-envelope"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control has-icons-left">
            <input class="input" type="password" placeholder="Password" v-model="password">
            <span class="icon is-small is-left">
              <i class="fa fa-lock"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control">
            <button class="button is-success" @click="signIn()">Login</button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import auth from '../auth'

export default {
  data () {
    return {
      login: '',
      password: '',
      error: null
    }
  },
  methods: {
    signIn () {
      auth.signIn(this.login, this.password).then(response => {
        this.$router.push({path: '/'})
        this.$toast.open({
          message: 'Welcome !',
          type: 'is-success'
        })
      }, response => {
        if (response.status === 401) {
          this.error = 'Can\'t log with this account name and password'
        } else {
          this.error = 'An error occured'
        }
      })
    }
  }
}
</script>
<style scoped>
  .margin {
    margin-top: 40px;
  }
</style>