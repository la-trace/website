<template>
  <div>
    <div class="file">
      <label class="file-label">
        <input class="file-input" id="file" type="file" @change="upload">
        <span class="file-cta">
          <span class="file-icon">
            <i class="fa fa-upload"></i>
          </span>
          <span class="file-label is-info">{{ $t("track_edit.choose_a_file") | toTitle }}</span>
        </span>
      </label>
    </div>

    <table class="table is-fullwidth is-padded">
      <thead>
        <th>Caption</th>
        <th>Size</th>
        <th>GPS data</th>
        <th></th>
      </thead>
      <tbody>
        <tr v-for="pic in pictures">
          <td>
            <input class="input" type="text" placeholder="Caption" v-model="pic.caption">
          </td>
          <td>{{pic.width}} x {{pic.height}} px</td>
          <td><i class="fa fa-check" aria-hidden="true" v-if="pic.position"></i></td>
          <td>
            <a class="button is-danger" @click="deletePic(pic.id)">{{ $t("common.delete") | toTitle }}</a>
            <a class="button is-info" @click="updateCaption(pic.id, pic.caption)">{{ $t("common.save") | toTitle }}</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '../../mixins/api'

export default {
  mixins: [api],
  props: ['id'],
  data () {
    return {
      pictures: null
    }
  },
  mounted () {
    this.loadPix()
  },
  methods: {
    upload () {
      const formData = new FormData()
      formData.append('file', document.getElementById('file').files[0])
      this.post('tracks/' + this.id + '/pictures', formData).then(() => {
        this.$toast.open({
          message: 'Upload successful',
          type: 'is-success'
        })
        this.loadPix()
      }, () => {
        this.$toast.open({
          message: 'Error',
          type: 'is-alert'
        })
      })
    },
    deletePic (id) {
      this.delete('pictures/' + id).then(() => {
        this.$toast.open({
          message: 'Delete successful',
          type: 'is-success'
        })
        this.loadPix()
      })
    },
    loadPix () {
      this.get('tracks/' + this.id).then(response => {
        this.pictures = response.body.pictures
      })
    },
    updateCaption (id, content) {
      const payload = {caption: content}
      this.patch('pictures/' + id, payload).then(() => {
        this.$toast.open({
          message: 'Update successful',
          type: 'is-success'
        })
      })
    }
  }
}
</script>
<style scoped>
  .is-padded {
    margin-top: 15px;
  }
</style>
