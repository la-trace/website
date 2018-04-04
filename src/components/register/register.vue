<template>
  <div class="container">
    <div class="columns is-centered margin">

      <div class="column is-three-quarters" v-if="created">
        <div class="notification is-success">
          {{ $t("register.account_created") | toTitle }}
        </div>
      </div>

      <div class="column is-three-quarters" v-else>
        <div class="notification is-danger" v-if="error">{{error | toTitle}}</div>

        <div class="field">
          <label class="label">{{ $t("common.name" ) | toTitle}}</label>
          <p class="control has-icons-left">
            <input class="input" type="email" placeholder="" v-model="name">
            <span class="icon is-small is-left">
              <i class="fa fa-user"></i>
            </span>
          </p>
          <p class="help is-danger" v-if="name.length === 0">{{ $t("register.field_cant_be_empty") | toTitle }}</p>
        </div>

        <div class="field">
          <label class="label">{{ $t("common.email" ) | toTitle}}</label>
          <p class="control has-icons-left">
            <input class="input" type="email" placeholder="" v-model="email">
            <span class="icon is-small is-left">
              <i class="fa fa-envelope"></i>
            </span>
          </p>
          <p class="help is-danger" v-if="email.length === 0">{{ $t("register.field_cant_be_empty") | toTitle }}</p>
          <p class="help is-danger" v-if="emailInvalid">{{ $t("register.email_invalid") | toTitle }}</p>
        </div>

        <div class="field">
          <label class="label">{{ $t("common.password" ) | toTitle}}</label>
          <p class="control has-icons-left">
            <input class="input" type="password" placeholder="" v-model="password">
            <span class="icon is-small is-left">
              <i class="fa fa-lock"></i>
            </span>
          </p>
          <p class="help is-danger" v-if="password.length === 0">{{ $t("register.field_cant_be_empty") | toTitle }}</p>
        </div>

        <div class="field">
          <label class="label">{{ $t("register.retype_password") | toTitle }}</label>
          <p class="control has-icons-left">
            <input class="input" type="password" placeholder="" v-model="passwordCheck">
            <span class="icon is-small is-left">
              <i class="fa fa-lock"></i>
            </span>
          </p>
          <p class="help is-danger" v-if="passwordCheck.length === 0">{{ $t("register.field_cant_be_empty") | toTitle }}</p>
          <p class="help is-danger" v-if="notMatch">{{ $t("register.passwords_not_match") | toTitle }}</p>
        </div>


        <div class="field">
          <p class="control">
            <button class="button is-success" @click="signUp()">{{ $t("common.save") | toTitle }}</button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../mixins/api'
import filters from '../../mixins/filters'

const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

function validateEmail (email) {
  return re.test(String(email).toLowerCase())
}

export default {
  mixins: [api, filters],
  data () {
    return {
      name: '',
      login: '',
      email: '',
      password: '',
      passwordCheck: '',
      valid: '',
      error: null,
      created: false
    }
  },
  computed: {
    notMatch () {
      return this.password.length && this.password !== this.passwordCheck
    },
    emailInvalid () {
      return this.email !== '' && !validateEmail(this.email)
    }
  },
  methods: {
    signUp () {
      if (this.notMatch || this.emailInvalid || this.name.length === 0) {
        this.error = this.$i18n.t('register.please_correct_errors')
        return
      }
      const params = {
        name: this.name,
        password: this.password,
        email: this.email
      }
      this.post('register', params).then(resp => {
        this.created = true
      }, resp => {
        if (resp.status === 409) {
          this.error = this.$i18n.t('register.account_already_exists')
        } else {
          this.error = this.$i18n.t('common.error_occured')
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