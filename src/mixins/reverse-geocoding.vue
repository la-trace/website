<script>
const url = 'https://nominatim.openstreetmap.org/reverse'

export default {
  methods: {
    setDisplayName: content => {
      if (!content) return
      const place = content.address.city || content.address.town || content.address.village
      const country = content.address.country
      return `${place}, ${country}`
    },
    reverseGeocoding (lon, lat) {
      return this.$http.get(url, {params: {format: 'json', lon: lon, lat: lat}}).then(response => {
        return {
          displayName: this.setDisplayName(response.body),
          raw: response.body
        }
      })
    }
  }
}
</script>