<template>
<div class="error-page-wrap">
    <div class="error-page">
        <div class="head">
            <div class="nav">
                <div class="back" @click="goBack">
                    <span class="icon-back">返回</span>
                </div>
                <div class="search-device">
                    <i class="icon-search" @click="searchDevice"></i>
                    <input v-model="deviceId" type="text" placeholder="搜索设备" @keyup.enter="searchDevice">
                </div>
            </div>
        </div>
        <div class="rel">
            <div class="error-wrap">
                <div class="search">
                    <div class="search-title">信息筛选：</div>
                    <ul class="search-list">

                        <li class="search-item">
                            <div class="search-item-title">线路：</div>
                            <div class="serach-item-label line-item-label">
                                <label><input name="line" type="radio" v-model="lineCode" value="0">全部</label>
                                <label v-for="(item, index) in lineList" :key="index"> <input name="line" type="radio" v-model="lineCode" :value="item.lineCode">{{item.lineName}}</label>
                            </div>
                        </li>
                        <li class="search-item">
                            <div class="search-item-title">线路：</div>
                            <div class="serach-item-label">
                                <label><input name="station" type="radio" v-model="stationCode" value="0">全部</label>
                                <label v-for="(item, index) in stationList" :key="index"><input name="station" type="radio"  v-model="stationCode" :value="item.stationCode">{{item.stationName}}</label>
                            </div>
                        </li>
                        <li class="search-item">
                            <div class="search-item-title">报警级别：</div>
                            <div class="serach-item-label">
                                <label><input name="degree" type="radio" v-model="filterDegree" value="0">全部</label>
                                <label><input name="degree" type="radio" v-model="filterDegree" value="1">紧急报警</label>
                                <label><input name="degree" type="radio" v-model="filterDegree" value="2">事故报警</label>
                                <label><input name="degree" type="radio" v-model="filterDegree" value="3">普通报警</label>
                                <label><input name="degree" type="radio" v-model="filterDegree" value="4">趋势报警</label>
                                <label><input name="degree" type="radio" v-model="filterDegree" value="5">初始报警</label>
                                <label><input name="degree" type="radio" v-model="filterDegree" value="6">设备故障报警</label>
                            </div>
                        </li>
                        <li class="search-item">
                            <div class="search-item-title">时间段：</div>
                            <div class="serach-item-label">
                                <label><input name="time" type="radio" v-model="filterTime" value="0">全部</label>
                                <label><input name="time" type="radio" v-model="filterTime" value="1">1天内</label>
                                <label><input name="time" type="radio" v-model="filterTime" value="3">3天内</label>
                                <label><input name="time" type="radio" v-model="filterTime" value="7">7天内</label>
                            </div>
                        </li>
                        <li class="search-item">
                            <div class="search-item-title">电梯类型：</div>
                            <div class="serach-item-label">
                                <label><input name="type" type="radio" v-model="filterType" value="0">全部</label>
                                <label><input name="type" type="radio" v-model="filterType" value="1">扶梯</label>
                                <label><input name="type" type="radio" v-model="filterType" value="2">直梯</label>
                            </div>
                        </li>
                        <li class="search-item">
                            <div class="search-item-title">报警状态：</div>
                            <div class="serach-item-label">
                                <label><input name="condition" type="radio" v-model="filterCondition" value="0">全部</label>
                                <label><input name="condition" type="radio" v-model="filterCondition" value="1">已确认</label>
                                <label><input name="condition" type="radio" v-model="filterCondition" value="2">未确认</label>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="result">
                    <div class="result-title">报警信息{{allWarningCount}}条：</div>
                    <table class="resut-table">
                        <thead>
                            <tr>
                                <th>优先级</th>
                                <th class="table-time">时间</th>
                                <th>站点</th>
                                <th>设备名称</th>
                                <th>报警信息</th>
                                <th>工单号</th>
                                <th>确认状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in warningList" :key="index">
                                <td :style="{background: colorList[item.level - 1]}">{{levelNameList[item.level - 1]}}</td>
                                <td class="table-time">{{item.time}}</td>
                                <td>{{item.stationName}}</td>
                                <td>{{item.device}}</td>
                                <td>{{item.remarks}}</td>
                                <td>{{item.trackID}}</td>
                                <td>
                                    <button v-if="item.status == 2" key="unconfirmed" @click="confirmWarning(index)">确认</button>
                                    <button v-else key="confirmed" class="checked">已确认</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                <!--    <ul class="pagination" v-show="warningList.length > 0">
                        <li @click="pageTurning(-1)" :class="{'disabled': curPage === 1}">上一页</li>
                        <li v-for="item in allPage" :class="{'disabled': curPage === item}" :key="item" @click="setPage(item)">{{item}}</li>
                        <li @click="pageTurning(1)" :class="{'disabled': curPage === allPage}">下一页</li>
                    </ul> -->
                    <el-pagination v-show="allWarningCount > 0"
                        background
                        layout="prev, pager, next"
                        :page-size="pageSize"
                        :current-page="curPage"
                        @current-change="setPage"
                        :total="allWarningCount">
                    </el-pagination>
                </div>
            </div>
            <device-modal ref="device"></device-modal>
        </div>
    </div>
</div>
</template>

<script>
// components
import Vue from "vue";
import DeviceModal from "../components/DeviceModal.vue";
import { Pagination } from "element-ui";

Vue.use(Pagination);

export default {
  name: "ErrorList",
  components: {
    DeviceModal
  },
  data() {
    return {
      // 分页
      curPage: 1,
      allWarningCount: 0,
      pageSize: 20,

      stationName: "",
      lineCode: this.$route.params.lineCode,
      stationCode: this.$route.params.stationCode,

      // modal
      deviceId: "",

      // 筛选
      filterDegree: 0,
      filterTime: 0,
      filterType: 0,
      filterCondition: 0,
      lineList: [],
      stationList: [],

      warningList: [],
      colorList: [
        "#f00",
        "#64427d",
        "#ffc200",
        "#fbff00",
        "#4d98db",
        "#808080"
      ],
      levelNameList: [
        "紧急报警",
        "事故报警",
        "普通报警",
        "趋势报警",
        "初始报警",
        "设备故障报警"
      ]
    };
  },
  created() {
    //this.lineCode = this.$route.params.lineCode || 0
    //this.stationCode = this.$route.params.stationCode || 0
    this.init();
  },
  methods: {
    init() {
      console.log("init", this.lineCode, this.stationCode);

      let lineList = sessionStorage.getItem("lineList");
      if (lineList) {
        this.lineList = JSON.parse(lineList);
      } else {
        this.getLineList();
      }

      if (this.stationCode != 0) {
        this.getStationList();
      }

      this.getWarningList();
    },
    getLineList() {
      let data = {
        serialNumber: this.$global().serialNumber
      };
      this.$post("/subway/warning_overview", data).then(res => {
        if (res.code === "success") {
          this.lineList = res.data.lines;
        } else {
          alert(res.message);
        }
      });
    },
    getStationList(type) {
      let data = {
        serialNumber: this.$global().serialNumber,
        data: {
          lineCode: this.lineCode
        }
      };
      this.$post("/subway/wraning_line", data).then(res => {
        console.log(res);
        if (res.code === "success") {
          this.stationList = res.data.stations;
          if (type === "watch") {
            this.stationCode = "0";
          }
        } else {
          alert(res.message);
        }
      });
    },
    getWarningList() {
      let data = this.filterDate;
      data.lineCode = this.lineCode;
      let params = {
        serialNumber: this.$global().serialNumber,
        page: this.curPage,
        pageSize: this.pageSize,
        data: data
      };
      this.$post("/subway/warning_list", params).then(res => {
        console.log(res);
        if (res.code === "success") {
          this.warningList = res.data.list;
          this.allWarningCount = res.total;
        } else {
          alert(res.message);
        }
      });
    },
    pageTurning(index) {
      this.curPage = this.curPage + index;

      this.getWarningList();
    },
    setPage(index) {
      this.curPage = index;

      this.getWarningList();
    },
    getStation(name, code) {
      this.$router.push({
        path: "/ErrorList",
        query: {
          lineCode: this.lineCode,
          stationCode: code,
          stationName: name
        }
      });

      this.init();
    },
    confirmWarning(index) {
      let id = this.warningList[index].id;
      let params = {
        serialNumber: this.$global().serialNumber,
        data: {
          arrayId: [id]
        }
      };
      this.$post("/subway/warning_confirm", params).then(res => {
        console.log(res);
        if (res.code === "success") {
          alert("确认成功！");
          this.warningList[index].status = 1;
        } else {
          alert(res.message);
        }
      });
    },
    goBack() {
      this.$router.go(-1);
    },
    searchDevice() {
      this.$refs.device.showDeviceModal(this.deviceId);
    }
  },
  computed: {
    filterDate() {
      this.curPage = 1;

      return {
        level: this.filterDegree,
        timeRange: this.filterTime,
        elevatorType: this.filterType,
        status: this.filterCondition,
        stationCode: this.stationCode
      };
    }
  },
  watch: {
    filterDate() {
      this.getWarningList();
    },
    lineCode: function(val) {
      if (this.lineCode == 0) {
        this.stationList = [];
        this.stationCode = 0;
      } else {
        this.getStationList("watch");
      }
    }
  }
};
</script>


<style lang="scss" scoped>
body {
  background-color: #f5f5f5;
}

.error-page-wrap {
  min-width: 1120px;
}

.error-wrap {
  display: flex;
  flex-direction: column;
  width: 1000px;
  margin: 0 auto;
  padding-top: 30px;

  > .rel {
    flex: 1;
  }
}

.search {
  display: flex;
  padding: 15px 20px 8px;
  margin-bottom: 30px;
  background-color: #ececee;

  > .search-title {
    width: 90px;
    min-width: 90px;
    color: #999;
  }

  > .search-list {
    flex-grow: 1;

    > .search-item {
      display: flex;
      margin-bottom: 8px;
      > .search-item-title {
        width: 90px;
        min-width: 90px;
      }

      > .serach-item-label {
        display: flex;
        flex-wrap: wrap;

        > label {
          min-width: 170px;
          height: 20px;
          margin-bottom: 7px;

          > input {
            margin-right: 5px;
          }
        }
      }

      > .line-item-label {
        > label {
          min-width: 200px;
        }
      }
    }
  }
}

.result {
  > .result-title {
    padding-left: 20px;
    color: #808080;
    margin-bottom: 10px;
  }
}
.resut-table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;

  > thead {
    background-color: #e1e2e6;
    text-align: left;

    th {
      font-weight: normal;
    }
  }

  tr {
    height: 36px;
    line-height: 36px;

    > th,
    > td {
      &:first-child {
        padding: 0 10px;
        text-align: center;
      }

      > button {
        width: 55px;
        height: 24px;
        line-height: 24px;
        background: #fff;
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.2);
        border-radius: 2px;
      }

      > .checked {
        background-color: #dedede;
        color: #999;
        cursor: default;
      }
    }

    &:nth-child(even) {
      background-color: #f0f0f0;
    }

    > .table-time {
      padding-left: 20px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  margin: 20px 0 40px;

  > li {
    height: 24px;
    line-height: 24px;
    padding: 0 9px;
    background: #fff;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    margin-right: 4px;
    cursor: pointer;

    &:last-child {
      margin-right: 0;
      margin-left: 6px;
    }

    &:first-child {
      margin-right: 10px;
    }
  }

  > .disabled {
    background-color: #dedede;
    color: #999;
    pointer-events: none;
    cursor: default;
  }
}

.error-page {
  padding-bottom: 40px;
  > .head {
    height: 40px;
    padding-bottom: 0;
  }
}
</style>
