<template>
    <!-- 站点详情页面 -->
    <div class="detail">
        <div class="container">
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
            <div class="station">
                <div class="station-title">
                    <h1>{{stationName}}站</h1>
                    <p><span>设备总数：{{normalDeviceCount + warningDeviceCount}}</span><span class="error">报警设备数：{{warningDeviceCount}}</span><span>正常设备数：{{normalDeviceCount}}</span></p>
                </div>
                <div class="device">
                    <div class="out-wrap">
                        <div class="device-wrap">
                            <div class="device-box" v-for="(item, index) in northwestList" :key="index">
                                <h3 class="out-name">{{item.name}}口（{{item.lineName}}）</h3>
                                <ul class="device-list">
                                    <li
                                      v-for="device in item.devices"
                                      :key="device.deviceNo"
                                      class="icon-dt" :class="'icon-dt' + device.deviceType + ' ' + 'condition' + device.deviceStatus"
                                      :title="deviceStatusNames[device.deviceStatus] + device.transformType + '类'"
                                      @click="showDeviceDetail(device.deviceNo)">({{ device.transformType }}类){{device.deviceNo}}</li>
                                </ul>
                            </div>
                        </div>
                        <div class="device-wrap">
                            <div class="device-box" v-for="(item, index) in northeastList" :key="index">
                                <h3 class="out-name">{{item.name}}口（{{item.lineName}}）</h3>
                                <ul class="device-list">
                                    <li
                                      v-for="device in item.devices"
                                      :key="device.deviceNo"
                                      class="icon-dt" :class="'icon-dt' + device.deviceType + ' ' + 'condition' + device.deviceStatus" 
                                      :title="deviceStatusNames[device.deviceStatus] + device.transformType + '类'"
                                      @click="showDeviceDetail(device.deviceNo)">({{ device.transformType }}类){{device.deviceNo}}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="platform" v-if="floorList.length > 0">
                        <div class="floor" v-for="(floor, index) in floorList" :key="index">
                            <h3 class="floor-name">{{floor.name}}站厅站台</h3>
                            <div class="floor-detail">
                                <div class="title"></div>
                                <ul class="floor-device-list">
                                    <li
                                      v-for="device in floor.devices"
                                      :key="device.deviceNo" class="icon-dt"
                                      :class="'icon-dt' + device.deviceType + ' ' + 'condition' + device.deviceStatus"
                                      :title="deviceStatusNames[device.deviceStatus] + device.transformType + '类'"
                                      @click="showDeviceDetail(device.deviceNo)">({{ device.transformType }}类){{device.deviceNo}}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="out-wrap">
                        <div class="device-wrap">
                            <div class="device-box" v-for="(item, index) in southwestList" :key="index">
                                <h3 class="out-name">{{item.name}}口（{{item.lineName}}）</h3>
                                <ul class="device-list">
                                    <li
                                      v-for="device in item.devices"
                                      :key="device.deviceNo"
                                      class="icon-dt" :class="'icon-dt' + device.deviceType + ' ' + 'condition' + device.deviceStatus"
                                      :title="deviceStatusNames[device.deviceStatus] + device.transformType + '类'"
                                      @click="showDeviceDetail(device.deviceNo)">({{ device.transformType }}类){{device.deviceNo}}</li>
                                </ul>
                            </div>
                        </div>
                        <div class="device-wrap">
                            <div class="device-box" v-for="(item, index) in southeastList" :key="index">
                                <h3 class="out-name">{{item.name}}口（{{item.lineName}}）</h3>
                                <ul class="device-list">
                                    <li
                                      v-for="device in item.devices"
                                      :key="device.deviceNo"
                                      class="icon-dt" :class="'icon-dt' + device.deviceType + ' ' + 'condition' + device.deviceStatus"
                                      :title="deviceStatusNames[device.deviceStatus] + device.transformType + '类'"
                                      @click="showDeviceDetail(device.deviceNo)">({{ device.transformType }}类){{device.deviceNo}}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div class="foot">
            <div class="newest">
                <div class="newest-title">
                    <h3>最新报警</h3>
                    <p @click="toErrorList">全部报警  &gt;</p>
                </div>
                <table class="newest-table">
                    <thead>
                        <tr>
                            <th>优先级</th>
                            <th class="table-time">时间</th>
                            <th>品牌</th>
                            <th>设备编号</th>
                            <th>设备名称</th>
                            <th>报警编号</th>
                            <th>报警信息</th>
                            <th>工单号</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr class="newest-row" v-for="(item, index) in warningList" :key="index">
                          <td
                            :style="{background: colorList[item.failureLevel]}"
                            :title="levelNameList[item.failureLevel]"
                          >{{levelNameList[item.failureLevel]}}</td>
                          <td :title="item.time" class="table-time">{{item.time}}</td>
                          <td :title="item.brandDesc">{{item.brandDesc}}</td>
                          <td :title="item.device">{{item.device}}</td>
                          <td :title="item.deviceName">{{item.deviceName}}</td>
                          <td :title="item.remarks">{{item.remarks}}</td>
                          <td :title="item.remark">{{item.remark}}</td>
                          <td :title="item.trackID">{{item.trackID}}</td>
                          <td>{{item.statusText}}</td>
                          <td class="btn-wrap">
                              <button class="btn" @click="confirmWarning(index, 'send')" :disabled="item.status != 3">
                                <span v-if="item.status == 1" key="send">已派单</span>
                                <span v-else key="unSend">派单</span>
                              </button>
                              <button class="btn" @click="confirmWarning(index, 'cancel')" :disabled="item.status != 3">
                                <span v-if="item.status == 2" key="cancel">已取消</span>
                                <span v-else key="unCancel">取消</span>
                              </button>
                          </td>
                      </tr>
                    </tbody>
                </table>
            </div>
            <div class="preview">
                <p class="icon-error-triangle">报警</p>
                <p>未处理：{{unconfirmedCount}} /  处理：{{confirmedCount}}</p>
                <ul class="preview-opr">
                    <li class="voice-wrap" @click="toggleVoice">声音<i class="icon-voice" :class="{'play': voicePlaying}"></i></li>
                </ul>
                <div class="user">
                    <p>{{date}}  {{weekDay}}</p>
                    <p class="time">{{curTime}}</p>
                </div>
                <audio ref="warningVoice" id="voice" src="/static/data/warning_voice.mp3" loop></audio>
            </div>
        </div>
        <device-modal ref="device"></device-modal>
    </div>
</template>

<script>
// components
import DeviceModal from "../components/DeviceModal.vue";

import { formatDate } from "../libs/formatDate.js";
export default {
  name: "StationDetail",
  components: {
    DeviceModal
  },
  data() {
    return {
      // user
      userId: '',
      userEmpcode: '',
      // 日期
      date: "",
      weekDay: "",
      curTime: "",
      // modal
      deviceId: "",

      warningList: [],
      // warningList: [{
      //   id: 1,
      //   failureLevel: 2,
      //   time: '2018-09-12',
      //   brandDesc: '奥克斯',
      //   device: 'ds-fre-43-f-fd',
      //   deviceName: '的丰富日光灯管防守打法',
      //   remark: '反而外国人挺好听任何一条',
      //   remarks: 1202,
      //   status: 1,
      //   statusText: '已派单',
      //   trackID: 'fdgrhtrhrthrt'
      // }, {
      //   id: 2,
      //   failureLevel: 1,
      //   time: '2018-09-12',
      //   brandDesc: '奥克斯',
      //   device: 'ds-fre-43-f-fd',
      //   deviceName: '的丰富日光灯管防守打法',
      //   remark: '反而外国人挺好听任何一条',
      //   remarks: 1203,
      //   status: 2,
      //   statusText: '已取消',
      //   trackID: 'fdgrhtrhrthrt'
      // }, {
      //   id: 3,
      //   failureLevel: 3,
      //   time: '2018-09-12',
      //   brandDesc: '奥克斯',
      //   device: 'ds-fre-43-f-fd',
      //   deviceName: '的丰富日光灯管防守打法',
      //   remarks: 1204,
      //   status: 3,
      //   statusText: '未处理',
      //   remark: '反而外国人挺好听任何一条',
      //   trackID: 'fdgrhtrhrthrt'
      // }],
      // 出口和站台设备
      southeastList: [],
      northeastList: [],
      southwestList: [],
      northwestList: [],
      floorList: [],

      unconfirmedCount: 0,
      confirmedCount: 0,

      lineStations: [],
      line: {
        name: "",
        color: ""
      },
      // 站点报警数量
      warningCount: 0,
      normalCount: 0,
      warningStationList: [],
      // params
      lineCode: "",
      stationCode: "",
      stationName: "",
      // 设备报警数量
      warningDeviceCount: 0,
      normalDeviceCount: 0,

      timer: null,
      colorList: {
        1: "#f00",
        2: "#64427d",
        3: "#ffc200",
        4: "#fbff00",
        5: "#4d98db",
        6: "#808080"
      },
      levelNameList: {
        1: "紧急报警",
        2: "事故报警",
        3: "普通报警",
        4: "趋势报警",
        5: "初始报警",
        6: "设备故障报警"
      },
      deviceStatusNames: {
        '9000': '未知 ',
        '9001': '急停 ',
        '9002': '停止 ',
        '9003': '正常上行 ',
        '9004': '正常下行 ',
        '9005': '检修 ',
        '9006': '故障 ',
        '9007': '消防/火警 ',
        '9008': '待机 ',
        '9009': 'Y-△运行模式 ',
        '9010': '节能运行模式 ',
        '9011': '断网 ',
        '9012': '节能上行 ',
        '9013': '节能下行 ',
        '0': '未接入 '
      },
      voicePlaying: false,
      isCanPlay: false
    };
  },
  mounted() {
    this.stationCode = this.$route.params.stationCode;
    this.lineCode = this.$route.params.lineCode;
    this.userId = sessionStorage.getItem('userId') || ''
    this.userEmpcode = sessionStorage.getItem('userEmpcode') || ''
    this.getStationInfo();
    this.init();
    this.initDate();
  },
  methods: {
    init() {
      this.getWarningLine();
      this.getWarningList();
      this.getStationEntrances();
      this.updateStation()
    },
    updateStation() {
      if (this.timer !== null) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.timer = setInterval(() => {
        this.getStationEntrances();
        this.getWarningList();
        this.getWarningLine();
        // 页面定时刷新 ms
      }, 120000);
    },
    getWarningLine() {
      let data = {
        serialNumber: this.$global().serialNumber,
        data: {
          lineCode: this.lineCode
        }
      };
      this.$post("/subway/wraning_line", data).then(res => {
        if (res.code === "success") {
          let data = res.data;
          let list = [];
          this.normalCount = data.normalCount;
          this.warningCount = data.warningCount;

          data.stations.forEach(item => {
            if (item.status == -1) {
              list.push(item);
            }
          });

          this.warningStationList = list;
        } else {
          alert(res.message);
        }
      });
    },
    getStationInfo() {
      let data = {
        serialNumber: this.$global().serialNumber,
        data: {
          lineCode: this.lineCode
        }
      };
      this.$post("/subway/station_info", data).then(res => {
        if (res.code === "success") {
          this.lineStations = res.data.stations;
          this.line.name = res.data.lineName;
          this.line.color = res.data.color;

          this.initLineSVG();
        } else {
          alert(res.message);
        }
      });
    },
    initLineSVG() {
      let heightSVG = document.getElementById("line-svg-wrap").offsetWidth - 80;
      let number = this.lineStations.length - 1;
      let ratio = (heightSVG / number).toFixed(2);
      let lineColor = this.line.color;
      let html = `<svg id="line-svg" ref="lineSVG" width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="50" x2="${heightSVG +
        70}" y2="50" stroke-width="4" stroke="${lineColor}" />`;

      this.lineStations.forEach((item, index) => {
        let x = index * ratio + 40;
        let textY = 35;
        if (index % 2 !== 0) {
          textY = 75;
        }
        if (item.code === this.stationCode) {
          html += `<image xlink:href="/static/images/icon_cur_station.png" width="14" height="14" x="${x -
            7}" y="43" sdata="${item.name}" code="${
            item.code
          }" index="${index}"></image>`;
          this.stationName = item.name
        } else if (!item.enabled) {
          html += `<circle r="6" cx="${x}" cy="50" fill="#ccc" stroke="black" stroke-width="1" sdata="${
            item.name
          }" code="${item.code}" index="${index}" data-disabled="1"></circle>`;
        } else if (item.transfered) {
          html += `<image xlink:href="/static/images/turn.png" width="14" height="14" x="${x -
            7}" y="43" sdata="${item.name}" code="${
            item.code
          }" index="${index}"></image>`;
        } else {
          html += `<circle r="6" cx="${x}" cy="50" fill="#fff" stroke="black" stroke-width="1" sdata="${
            item.name
          }" code="${item.code}" index="${index}"></circle>`;
        }

        if (item.enabled) {
          html += `<text x="${x}" y="${textY}" fill="#333" style="text-anchor: middle;"><tspan>${
            item.name
          }</tspan></text>`;
        } else {
          html += `<text x="${x}" y="${textY}" fill="#999" style="text-anchor: middle;"><tspan>${
            item.name
          }</tspan></text>`;
        }
      });

      html += `</svg>`;

      $("#line-svg-wrap").html(html);
    },
    selectStation(event) {
      let $event = $(event.target);
      let nodeName = $event[0].nodeName;

      if (nodeName === "circle" || nodeName === "image") {
        let isDisabled = $event.attr("data-disabled");
        let stationCode = $event.attr("code");

        if (!isDisabled && stationCode && stationCode !== this.stationName) {
          let sdata = $event.attr("sdata");

          this.stationName = sdata;
          this.stationCode = stationCode;

          this.initLineSVG();

          this.getStation(stationCode);
        }
      }
    },
    goBack() {
      this.$router.push('/');
    },
    searchDevice() {
      this.showDeviceDetail(this.deviceId);
    },
    getStationEntrances() {
      let data = {
        serialNumber: this.$global().serialNumber,
        data: {
          lineCode: this.lineCode,
          stationCode: this.stationCode
        }
      };
      this.$post("/subway/station_entrances", data).then(res => {
        if (res.code === "success") {
          let entrances = res.data.entrances,
            initIndex = 1,
            southeastList = [],
            northeastList = [],
            southwestList = [],
            northwestList = [];

          entrances.forEach(item => {
            switch (initIndex) {
              case 1:
                northwestList.push(item);
                break;
              case 2:
                northeastList.push(item);
                break;
              case 3:
                southwestList.push(item);
                break;
              case 4:
                initIndex = 0;
                southeastList.push(item);
                break;
            }
            initIndex++;
          });

          this.southeastList = southeastList;
          this.northeastList = northeastList;
          this.southwestList = southwestList;
          this.northwestList = northwestList;

          this.floorList = res.data.floors;

          this.normalDeviceCount = res.data.normalDeviceCount;
          this.warningDeviceCount = res.data.warningDeviceCount;
          if (this.isCanPlay && this.warningDeviceCount > 0) {
            this.toPlay()
          }
        } else {
          alert(res.message);
        }
      });
    },
    getWarningList() {
      let data = {
        serialNumber: this.$global().serialNumber,
        page: 1,
        pageSize: 3,
        data: {
          lineCode: this.lineCode,
          stationCode: this.stationCode,
          level: 0,
          startTime: '',
          endTime: '',
          elevatorType: 0,
          status: 0,
          deviceNo: '',
          sortBy: 'time',
          sortType: 'descending'
        }
      };
      this.$post("/subway/warning_list", data).then(res => {
        if (res.code === "success") {
          this.warningList = res.data.list;
          this.unconfirmedCount = res.data.unconfirmedCount;
          this.confirmedCount = res.data.confirmedCount;
        } else {
          alert(res.message);
        }
      });
    },
    initDate() {
      let now = formatDate(new Date(), "yyyy-MM-dd EEE HH:mm:ss");
      let nowArr = now.split(" ");

      this.date = nowArr[0];
      this.weekDay = nowArr[1];
      this.curTime = nowArr[2];

      setInterval(this.updateTime, 1000);
    },
    updateTime() {
      let now = formatDate(new Date(), "yyyy-MM-dd EEE HH:mm:ss");
      let nowArr = now.split(" ");

      this.curTime = nowArr[2];

      let hour = nowArr[2].split(":")[0];

      if (hour === "00") {
        this.date = nowArr[0];
        this.weekDay = nowArr[1];
      }
    },
    showDeviceDetail(id) {
      this.$refs.device.showDeviceModal(id);
    },
    getStation(code) {
      this.$router.push({
        name: "StationDetail",
        params: {
          lineCode: this.lineCode,
          stationCode: code
        }
      });
      this.init()
    },
    toErrorList() {
      this.$router.push({
        name: "ErrorList",
        params: {
          lineCode: this.lineCode,
          stationCode: this.stationCode
        }
      });
    },
    confirmWarning(index, type) {
      let id = this.warningList[index].id;
      let confirmText = type === 'send' ? '派单' : '取消报警'
      let confirmStatus = window.confirm(`请确认是否${confirmText}`)
      if (confirmStatus) {
        let params = {
          serialNumber: this.$global().serialNumber,
          data: {
            arrayId: [id],
            opr: type,
            userId: this.userId,
            userEmpcode: this.userEmpcode
          }
        };
        this.$post("/subway/warning_confirm", params).then(res => {
          if (res.code === "success") {
            alert(`${confirmText}成功`)
            this.warningList[index].status = res.data.status;
            this.warningList[index].statusText = res.data.statusText;
          } else {
            alert(res.message);
          }
        });
      }
    },
    toPlay () {
      this.$refs.warningVoice.play()
      this.voicePlaying = true
    },
    toPause () {
      this.$refs.warningVoice.pause()
      this.voicePlaying = false
    },
    toggleVoice () {
      this.voicePlaying = !this.voicePlaying
      if (this.warningDeviceCount > 0) {
        if (this.voicePlaying) {
          this.toPlay()
        } else {
          this.toPause()
        }
      }
    }
  },
  destroyed() {
    clearInterval(this.timer);
    this.timer = null;
  }
};
</script>

<style lang="scss" scoped>
.detail {
  height: 100%;
  position: relative;
  min-width: 1920px;
}
.icon-error-triangle {
  background: url(../assets/icon_error_triangle.png) left center / 15px 12.5px
    no-repeat;
}

.icon-dt {
  background-repeat: no-repeat;
  background-size: 44px 44px;
  background-position: center top;
  cursor: pointer;
}

.icon-dt1 {
  &.condition9000 {
    background-image: url(../assets/elevator/icon_ft_wz.png);
  }
  &.condition9001 {
    background-image: url(../assets/elevator/icon_ft_jj.png);
  }
  &.condition9002 {
    background-image: url(../assets/elevator/icon_ft_out.png);
  }
  &.condition9003 {
    background-image: url(../assets/elevator/icon_ft_up.png);
  }
  &.condition9004 {
    background-image: url(../assets/elevator/icon_ft_down.png);
  }
  &.condition9005 {
    background-image: url(../assets/elevator/icon_ft_jx.png);
  }
  &.condition9006 {
    background-image: url(../assets/elevator/icon_ft_gz.png);
  }
  &.condition9007 {
    background-image: url(../assets/elevator/icon_ft_xf.png);
  }
  &.condition9009 {
    background-image: url(../assets/elevator/icon_ft_y.png);
  }
  &.condition9010 {
    background-image: url(../assets/elevator/icon_ft_jn.png);
  }
  &.condition9011 {
    background-image: url(../assets/elevator/icon_ft_dw.png);
  }
  &.condition9012 {
    background-image: url(../assets/elevator/icon_ft_jn.png);
  }
  &.condition9013 {
    background-image: url(../assets/elevator/icon_ft_jn_down.png);
  }
  &.condition0 {
    background-image: url(../assets/elevator/icon_ft_qt.png);
  }
}

.icon-dt2 {
  &.condition9000 {
    background-image: url(../assets/elevator/icon_zt_wz.png);
  }
  &.condition9001 {
    background-image: url(../assets/elevator/icon_zt_jj.png);
  }
  &.condition9002 {
    background-image: url(../assets/elevator/icon_zt_out.png);
  }
  &.condition9003 {
    background-image: url(../assets/elevator/icon_zt_dj.png);
  }
  &.condition9004 {
    background-image: url(../assets/elevator/icon_zt_dj.png);
  }
  &.condition9005 {
    background-image: url(../assets/elevator/icon_zt_jx.png);
  }
  &.condition9006 {
    background-image: url(../assets/elevator/icon_zt_gz.png);
  }
  &.condition9007 {
    background-image: url(../assets/elevator/icon_zt_xf.png);
  }
  &.condition9008 {
    background-image: url(../assets/elevator/icon_zt_dj.png);
  }
  &.condition9009 {
    background-image: url(../assets/elevator/icon_zt_y.png);
  }
  // &.condition9010 {
  //   background-image: url(../assets/elevator/icon_zt_jn.png);
  // }
  &.condition9011 {
    background-image: url(../assets/elevator/icon_zt_dw.png);
  }
  &.condition0 {
    background-image: url(../assets/elevator/icon_zt_qt.png);
  }
}

.container {
  // height: 100%;
  min-height: 100%;

  &:after {
    content: "";
    display: block;
    width: 100%;
    height: 195px;
  }
}

.station {
  position: relative;
  // min-height: 600px;
  padding: 40px 100px 20px;
  background-color: #f5f5f5;

  > .station-title {
    text-align: center;
    margin-bottom: 20px;

    > h1 {
      font-size: 24px;
      line-height: 32px;
    }

    > p {
      display: inline-block;
      margin: 0 auto 4px;
      padding: 0 6px;
      font-size: 12px;
      background: #e6e6e6;
      border-radius: 2px;

      > span {
        &:not(:last-child) {
          margin-right: 5px;
        }
      }
    }
  }
}

.out-wrap {
  display: flex;
  justify-content: space-between;
}

.device-wrap {
  display: flex;
  justify-content: space-between;
  align-content: flex-start;
  flex-wrap: wrap;
  width: 710px;

  > .device-box {
    position: relative;
    width: 350px;
    margin-bottom: 10px;

    > .out-name {
      position: absolute;
      top: 0;
      left: 0;
      height: 22px;
      line-height: 22px;
      padding: 0 10px;
      color: #fff;
      background: rgba(0, 0, 0, 0.7);
      border-top-left-radius: 8px;
    }

    > .device-list {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      padding: 30px 0 10px;
      font-size: 11px;
      border: 2px solid #009bc0;
      border-radius: 8px;
      background-color: #fff;
      color: #999;

      > .icon-dt {
        width: 33.3333%;
        height: 63px;
        line-height: 13px;
        padding-top: 50px;
        text-align: center;
        margin-bottom: 12px;
      }
    }
  }
}

.platform {
  background: #ececee;
  border-radius: 8px;
  padding: 20px 40px;
  margin: 10px 0 20px;
}

.floor {
  display: flex;

  &:not(:last-child) {
    margin-bottom: 15px;
  }

  > .floor-name {
    min-width: 115px;
    font-size: 14px;
    color: #999;
  }

  > .floor-detail {
    flex: 1;

    > .title {
      padding: 5px 0 10px;
      font-size: 12px;
      border-top: 1px solid #ccc;
    }

    > .floor-device-list {
      display: flex;
      flex-wrap: wrap;
      text-align: center;

      > .icon-dt {
        width: 115px;
        height: 63px;
        padding-top: 50px;
        line-height: 13px;
        font-size: 11px;
        margin: 0 25px 12px 0;
      }
    }
  }
}

.foot {
  display: flex;
  justify-content: space-between;
  height: 195px;
  margin-top: -195px;
  padding: 10px 100px;
  background-color: #d9dbde;

  > .preview {
    width: 140px;
    padding-left: 20px;
    font-size: 13px;
    overflow: hidden;
    > p {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }

    > .icon-error-triangle {
      padding-left: 20px;
      font-size: 14px;
    }

    > .preview-opr {
      display: flex;

      > li {
        height: 24px;
        line-height: 24px;
        padding: 0 12px;
        color: #fff;
        background: #525766;
        cursor: pointer;

        &:not(:last-child) {
          margin-right: 5px;
        }
      }

      >.voice-wrap {
        display: flex;
        align-items: center;
        >.icon-voice {
          margin-left: 5px;
          width: 16px;
          height: 16px;
          background: url("../assets/icon_voice_pause.png") center center / 16px 16px no-repeat;

          &.play {
            background-image: url("../assets/icon_voice_play.png");
          }
        }
      }
      
    }
    > .user {
      font-size: 13px;
      line-height: 18px;
      text-align: center;
      margin-top: 20px;

      > .time {
        line-height: 28px;
        font-size: 20px;
        margin-top: 10px;
        color: #0a6bcc;
      }
    }
  }

  > .newest {
    width: 1570px;
    overflow: hidden;

    > .newest-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 20px;
      margin-bottom: 7px;

      > h3 {
        font-size: 14px;
      }

      > p {
        font-size: 13px;
        cursor: pointer;
      }
    }
  }
}

.newest-table {
  width: 100%;
  background-color: #d2d4d7;
  border-collapse: collapse;
  table-layout: fixed;
  text-align: center;
  cursor: default;

  >thead {
    >tr {
      height: 36px;
      line-height: 36px;
      background-color: #e1e2e6;
    }
  }

  .newest-row {
    height: 36px;
    line-height: 36px;
    &:nth-child(even) {
      background-color: #ccced0;
    }

    > td {
      height: 36px;
      line-height: 36px;
      padding: 0 8px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      &:first-child {
        text-align: center;
      }
    }

    // > .table-time {
    //   padding-left: 20px;
    // }
  }
}

svg {
  text {
    text-anchor: middle;
  }
}
</style>
