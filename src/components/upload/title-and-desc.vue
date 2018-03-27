brew install libusb-compat<template>
  <div>
    <div class="notification is-primary">
      Please add a name and a description, name should contains at least 10 characters and description 50.
    </div>
    <div class="field">
      <label class="label">Name</label>
      <p class="control">
        <input class="input" type="text" placeholder="Normal input" v-model="name">
      </p>
      <p class="help">{{name.length}} character(s)</p>
    </div>
    <div class="field">
      <label class="label">Description</label>
      <p class="control">
        <textarea class="textarea" placeholder="Normal textarea" v-model="description"></textarea>
      </p>
      <p class="help">{{description.length}} character(s)</p>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    next () {
      this.$store.commit('incStep')
    },
    check () {
      if (this.name.length > 10 && this.description.length > 50) {
        this.$store.commit('setStepOK')
      } else {
        this.$store.commit('setStepNok')
      }
    }
  },
  watch: {
  },
  computed: {
    name: {
      get () {
        return this.$store.state.track.geojson.properties.name
      },
      set (value) {
        this.$store.commit('setTrackName', value)
        this.check()
      }
    },
    description: {
      get () {
        return this.$store.state.track.geojson.properties.description
      },
      set (value) {
        this.$store.commit('setTrackDescription', value)
        this.check()
      }
    }
  }
}
</script>