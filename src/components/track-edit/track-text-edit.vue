<template>
<div>
  <div class="field">
    <label class="label">Name</label>
    <p class="control">
      <input class="input" type="text" placeholder="Normal input" v-model="track.name">
    </p>
  </div>
  <div class="field">
    <label class="label">Description</label>
    <p class="control">
      <textarea class="textarea" placeholder="Normal textarea" rows="10" v-model="track.description"></textarea>
    </p>
  </div>
</div>
</template>

<script>
import api from '../../mixins/api'

export default {
  props: ['track'],
  mixins: [api],
  data () {
    return {
    }
  },
  components: {
  },
  computed: {
  },
  methods: {
  },
  mounted () {
  }
}
</script>
<style scoped>
</style>