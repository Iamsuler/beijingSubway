<template>
    <div class="head">
        <div class="nav">
            <div class="back" @click="goBack">
                <span class="icon-back">返回</span>
            </div>
            <div class="line">{{line.name}}</div>
            <div class="error-wrap">
                <p>
                    <span class="error">报警站点：{{warningCount}}个</span>
                    <span>正常站点：{{normalCount}}个</span>
                </p>
                <p class="error">
                    <span class="icon-error-triangle">报警站点：</span>
                    <span v-for="(item, index) in warningStationList" :key="index">{{item.stationName}}</span>
                </p>
            </div>
            <div class="search-device">
                <i class="icon-search" @click="searchDevice"></i>
                <input v-model="deviceId" type="text" placeholder="搜索设备" @keyup.enter="searchDevice">
            </div>
        </div>
        <div class="station-line">
            <div id="line-svg-wrap" @click="selectStation"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HeadNav',
    data () {
        return {
            deviceId: '',

            // station line
            lineStations: [],
            line: {
              name: '',
              color: '',
            },

            warningCount: 0,
            normalCount: 0,
            warningStationList: [],

            lineCode: '',
            stationCode: '',
            stationName: ''

        }
    },
    created () {
        this.lineCode = this.$route.query.lineCode
        this.stationCode = this.$route.query.stationCode
        this.stationName = this.$route.query.stationName
    },
    mounted () {

        this.getWarningLine();
        this.getStationInfo();
        
    },
    methods: {
      getWarningLine () {
        let data = {
            serialNumber: this.$global().serialNumber,
            lineName: this.lineCode
        }
        this.$post('/subway/wraning_line.do', data).then(res => {
            console.log(res)
            if (res.code === 'success') {
                let data = res.data;
                let list = [];
                this.normalCount = data.normalCount
                this.warningCount = data.warningCount

                data.stations.forEach(item => {
                    if (item.status == -1) {
                        list.push(item)
                    }
                })

                this.warningStationList = list
            } else {
                alert(res.message)
            }
        })
      },
      getStationInfo () {
        let data = {
            serialNumber: this.$global().serialNumber,
            lineName: this.lineCode
        }
        this.$post('/subway/station_info.do', data).then(res => {
            console.log(res)
            if (res.code === 'success') {
            this.lineStations = res.data.stations
            this.line.name = res.data.lineName
            this.line.color = res.data.color


            this.initLineSVG();
        } else {
          alert(res.message)
        }
        })
      },
        initLineSVG () {
            let heightSVG = document.getElementById('line-svg-wrap').offsetWidth - 80
            let number = this.lineStations.length - 1
            let ratio = (heightSVG / number).toFixed(2)
            let lineColor = this.line.color
            let html = `<svg id="line-svg" ref="lineSVG" width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="50" x2="${heightSVG + 70}" y2="50" stroke-width="4" stroke="${lineColor}" />`
            
            this.lineStations.forEach((item, index) => {
                let x = index * ratio + 40
                let textY = 35
                if (index % 2 !== 0) {
                    textY = 75
                }
                if (item.name === this.stationName) {
                    html += `<image xlink:href="/static/images/icon_cur_station.png" width="14" height="14" x="${x - 7}" y="43" sdata="${item.name}" code="${item.code}" index="${index}"></image>`
                } else if (item.transfered) {
                    html += `<image xlink:href="/static/images/turn.png" width="14" height="14" x="${x - 7}" y="43" sdata="${item.name}" code="${item.code}" index="${index}"></image>`
                } else if (!item.enabled) {
                    html += `<circle r="4" cx="${x}" cy="50" fill="#ccc" stroke="black" stroke-width="1" sdata="${item.name}" code="${item.code}" index="${index}" data-disabled="1"></circle>`
                } else {
                    html += `<circle r="4" cx="${x}" cy="50" fill="#fff" stroke="black" stroke-width="1" sdata="${item.name}" code="${item.code}" index="${index}"></circle>`
                }

                if (item.enabled) {
                    html += `<text x="${x}" y="${textY}" fill="#333" style="text-anchor: middle;"><tspan>${item.name}</tspan></text>`
                } else {
                    html += `<text x="${x}" y="${textY}" fill="#999" style="text-anchor: middle;"><tspan>${item.name}</tspan></text>`
                }
            })

            html += `</svg>`
            

            $('#line-svg-wrap').html(html)
        },
        selectStation (event) {
            let $event = $(event.target)
            let nodeName = $event[0].nodeName

            if (nodeName === 'circle'  || nodeName === 'image') {
                let isDisabled = $event.attr('data-disabled')
                let sdata = $event.attr('sdata') || ''

                console.log(sdata, isDisabled)

                if (isDisabled && sdata && sdata !== this.stationName) {
                    let stationCode = $event.attr('code')

                    this.stationName = sdata
                    this.stationCode = stationCode

                    this.initLineSVG()

                    this.$emit('sendStation', sdata, '0830')
                }
            }
        },
        goBack () {
            this.$router.go(-1)
        },
        searchDevice () {
            this.$emit('searchDevice', this.deviceId)
        }
    }
}
</script>
