<script>
export default {
  filters: {
    toTitle: str => str.charAt(0).toUpperCase() + str.substring(1),
    toFixed: function (v, n) {
      if (v) {
        return v.toFixed(n)
      }
    },
    toKm: function (v) {
      let newValue = v / 1000
      return newValue.toFixed(2)
    },
    formatDate: function (v) {
      let d = new Date(Date.parse(v))
      return d.toLocaleDateString('fr-FR')
    }
  }
}
</script>