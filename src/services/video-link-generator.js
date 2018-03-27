let availablePlatforms = ['youtube', 'vimeo', 'dailymotion']

export default {
  getLink (platform, slug) {
    if (availablePlatforms.indexOf(platform) === -1) {
      return false
    }

    let src = ''

    switch (platform) {
      case 'youtube':
        src = 'https://www.youtube.com/embed/' + slug
        break
      case 'vimeo':
        src = 'https://player.vimeo.com/video/' + slug
        break
      case 'dailymotion':
        src = 'https://www.dailymotion.com/embed/video/' + slug
        break
    }

    return src
  }
}
