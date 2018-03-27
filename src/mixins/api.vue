<script>
import Nprogress from 'nprogress'

const host = process.env.API

const generateUrl = url => {
  if (url.startsWith('http') || url.startsWith('https')) {
    return url
  } else {
    return host + url
  }
}

const decoreParams = params => {
  if (!params) return
  const j = window.localStorage.getItem('token')
  if (!j) return params
  const data = JSON.parse(j)
  if (!params.headers) params.headers = {}
  params.headers['Authorization'] = 'Bearer ' + data.token
  return params
}

const startProgress = () => Nprogress.start()
const endProgress = () => Nprogress.done()

export default {
  methods: {
    get (url, params) {
      startProgress()
      if (!params) {
        params = {}
      }
      return this.$http.get(generateUrl(url), decoreParams(params)).then(response => {
        endProgress()
        return response
      }, (e) => {
        endProgress()
        return e
      })
    },
    post (url, body, params) {
      if (!body) {
        body = {}
      }
      if (!params) {
        params = {}
      }
      return this.$http.post(generateUrl(url), body, decoreParams(params))
    },
    put (url, body, params) {
      if (!body) {
        body = {}
      }
      if (!params) {
        params = {}
      }
      return this.$http.put(generateUrl(url), body, decoreParams(params))
    },
    patch (url, body, params) {
      if (!body) {
        body = {}
      }
      if (!params) {
        params = {}
      }
      return this.$http.patch(generateUrl(url), body, decoreParams(params))
    },
    delete (url, params) {
      if (!params) {
        params = {}
      }
      return this.$http.delete(generateUrl(url), decoreParams(params))
    }
  }
}
</script>