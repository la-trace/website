<template>
  <div id="elevation-wrapper">
    <highcharts :options="options" ref="highcharts"></highcharts>
  </div>
</template>

<script>
import bus from '../bus-event'
import api from '../../mixins/api'
let formatElevation = function (row) {
  let e = {
    x: row[0],
    y: row[1],
    lng: row[2],
    lat: row[3]
  }
  return e
}

let options = {
  chart: {
    renderTo: 'elevation',
    zoomType: 'x',
    marginLeft: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    type: 'area',
    height: 300
  },
  title: {
    text: null
  },
  subtitle: {
    text: null
  },
  xAxis: {
    type: 'linear',
    gridLineWidth: 1,
    title: {
      text: 'Distance en km'
    },
    labels: {
      formatter: function () {
        return (this.value / 1000).toFixed(2)
      }
    }
  },
  yAxis: {
    min: 0,
    title: {
      text: null
    },
    labels: {
      style: {
        'font-size': '9px'
      }
    }
  },
  tooltip: {
    shadow: false,
    shared: true,
    crosshairs: true,
    formatter: function () {
      return this.points[0].y + 'm @ ' + (this.x / 1000).toFixed(2) + ' km'
    }
  },
  legend: {
    enabled: false
  },
  credits: {
    enabled: false
  },
  plotOptions: {
    area: {
      shadow: false,
      lineColor: '#CCC',
      fillColor: '#AFD425',
      lineWidth: 1,
      marker: {
        enabled: false,
        fillColor: '#AFD425',
        radius: 2,
        states: {
          hover: {
            enabled: true
          }
        }
      },
      states: {
        hover: {
          enabled: true,
          lineWidth: 1
        }
      }
    },
    series: {
      point: {
        events: {
          mouseOver: function () {
            bus.$emit('map.movemarker', this.lng, this.lat)
          }
        }
      }
    }
  },
  series: [{
    color: '#2F333D',
    opacity: 0.05,
    lineWidth: 1,
    data: []
  }]
}

export default {
  props: ['trackId'],
  mixins: [api],
  data () {
    return {
      options: options,
      dataLoaded: false
    }
  },
  created () {
    let me = this
    let url = '/tracks/' + this.trackId + '/elevations'
    me.get(url).then(response => {
      response.body = response.body.map(formatElevation)
      me.dataLoaded = true
      setTimeout(function () {
        me.$refs.highcharts.chart.series[0].setData(response.body)
      }, 200)
    }, (response) => {
    })
  }
}
</script>
<style scoped>
#elevation-wrapper {
  width: 100%;
  height: 300px;
}
</style>