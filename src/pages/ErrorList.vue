<template>
  <!-- 全部报警页面 -->
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
                              <div class="search-item-title">站点：</div>
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
                                  <el-date-picker
                                    v-model="filterTime"
                                    :value-format="'yyyy-MM-dd HH:mm:ss'"
                                    @change="dateChange"
                                    type="datetimerange"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    :picker-options="datePickerOptions"
                                    end-placeholder="结束日期">
                                  </el-date-picker>
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
                          <li class="search-item">
                              <div class="search-item-title">设备编号：</div>
                              <div class="serach-item-label">
                                  <input class="serach-item-input" type="text" placeholder="请输入要查询的设备编号" v-model="filterDeviceNo">
                              </div>
                          </li>
                          <li class="search-item">
                              <div class="search-item-title"></div>
                              <div class="serach-item-label">
                                  <button class="btn" @click="filterDate">确认</button>
                              </div>
                          </li>
                      </ul>
                  </div>

                  <div class="result">
                      <div class="result-title">报警信息{{allWarningCount}}条：</div>
                      <el-table
                        :data="warningList"
                        style="width: 100%"
                        @sort-change="sortChange"
                        :row-class-name="tableRowClassName"
                        >
                        <el-table-column
                          prop="failureLevel"
                          label="优先级"
                          sortable="custom"
                          :formatter="levelFormatter">
                        </el-table-column>
                        <el-table-column
                          prop="time"
                          label="时间"
                          sortable="custom">
                        </el-table-column>
                        <el-table-column
                          prop="brandDesc"
                          label="品牌">
                        </el-table-column>
                        <el-table-column
                          prop="device"
                          sortable="custom"
                          label="设备编号">
                        </el-table-column>
                        <el-table-column
                          prop="deviceName"
                          label="设备名称">
                        </el-table-column>
                        <el-table-column
                          prop="remarks"
                          label="报警编号">
                        </el-table-column>
                        <el-table-column
                          prop="remark"
                          label="报警信息">
                        </el-table-column>
                        <el-table-column
                          prop="trackID"
                          label="工单号">
                        </el-table-column>
                      </el-table>
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
import { Pagination, DatePicker, Table, TableColumn } from "element-ui";

Vue.use(Pagination).use(DatePicker).use(Table).use(TableColumn);

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
      filterTime: '',
      startTime: '',
      endTime: '',
      filterType: 0,
      filterCondition: 0,
      lineList: [],
      stationList: [],
      filterDeviceNo: '',
      sortBy: 'time',
      sortType: 'descending',

      // warningList: [{
      //   level: 2,
      //   time: '2018-09-12',
      //   brandDesc: '奥克斯',
      //   device: 'ds-fre-43-f-fd',
      //   deviceName: '的丰富日光灯管防守打法',
      //   remark: '反而外国人挺好听任何一条',
      //   trackID: 'fdgrhtrhrthrt'
      // }, {
      //   level: 1,
      //   time: '2018-09-12',
      //   brandDesc: '奥克斯',
      //   device: 'ds-fre-43-f-fd',
      //   deviceName: '的丰富日光灯管防守打法',
      //   remark: '反而外国人挺好听任何一条',
      //   trackID: 'fdgrhtrhrthrt'
      // }, {
      //   level: 3,
      //   time: '2018-09-12',
      //   brandDesc: '奥克斯',
      //   device: 'ds-fre-43-f-fd',
      //   deviceName: '的丰富日光灯管防守打法',
      //   remark: '反而外国人挺好听任何一条',
      //   trackID: 'fdgrhtrhrthrt'
      // }],
      warningList: [],
      levelNameList: {
        1: "紧急报警",
        2: "事故报警",
        3: "普通报警",
        4: "趋势报警",
        5: "初始报警",
        6: "设备故障报警"
      },
      warningTimer: null,
      datePickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
            text: '最近一天',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
                picker.$emit('pick', [start, end]);
              }
            }, {
            text: '最近三天',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
                picker.$emit('pick', [start, end]);
              }
            }, {
            text: '最近一周',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit('pick', [start, end]);
              }
            }
          ]
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    tableRowClassName (args) {
      return `level-color${args.row.failureLevel}`
    },
    sortChange (args) {
      this.sortBy = args.prop
      this.sortType = args.order
      this.getWarningList()
    },
    levelFormatter (row, column) {
      return this.levelNameList[row.failureLevel]
    },
    init() {
      let lineList = sessionStorage.getItem("lineList");
      if (lineList) {
        this.lineList = JSON.parse(lineList);
      } else {
        this.getLineList();
      }

      if (this.stationCode != 0) {
        this.getStationList();
      }

      this.getWarningList()
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
      let data = {
        lineCode: this.lineCode,
        level: this.filterDegree,
        startTime: this.startTime,
        endTime: this.endTime,
        elevatorType: this.filterType,
        status: this.filterCondition,
        stationCode: this.stationCode,
        deviceNo: this.filterDeviceNo,
        sortBy: this.sortBy,
        sortType: this.sortType
      }
      let params = {
        serialNumber: this.$global().serialNumber,
        page: this.curPage,
        pageSize: this.pageSize,
        data: data
      };
      this.$post("/subway/warning_list", params).then(res => {
        if (res.code === "success") {
          this.warningList = res.data.list;
          this.allWarningCount = res.total;
        } else {
          alert(res.message);
        }
      });
    },
    setPage(index) {
      this.curPage = index;
      this.getWarningList();
    },
    goBack() {
      this.$router.go(-1);
    },
    searchDevice() {
      this.$refs.device.showDeviceModal(this.deviceId);
    },
    filterDate() {
      this.curPage = 1;
      this.getWarningList();
    },
    dateChange (value) {
      if (value) {
        this.startTime = value[0]
        this.endTime = value[1]
      }
    }
  },
  watch: {
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

        >.btn {
          padding: 5px 15px;
          font-size: 12px;
          border-radius: 5px;
          background-color: #fff;
        }

        >.serach-item-input {
          min-width: 200px;
          height: 36px;
          line-height: 36px;
          padding-left: 10px;
          font-size: 14px;
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
    color: #808080;
    margin-bottom: 10px;
  }

  /deep/ .el-table {
    th {
      background-color: #e1e2e6;
    }

    td {
      padding: 5px 0;
    }

    .level-color1 {
      td {
        &:first-child {
          color: #fff;
          background-color: #f00;
        }
      }
    }
    .level-color2 {
      td {
        &:first-child {
          color: #fff;
          background-color: #64427d;
        }
      }
    }
    .level-color3 {
      td {
        &:first-child {
          color: #fff;
          background-color: #ffc200;
        }
      }
    }
    .level-color4 {
      td {
        &:first-child {
          color: #fff;
          background-color: #fbff00;
        }
      }
    }
    .level-color5 {
      td {
        &:first-child {
          color: #fff;
          background-color: #4d98db;
        }
      }
    }
    .level-color6 {
      td {
        &:first-child {
          color: #fff;
          background-color: #808080;
        }
      }
    }
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
        padding: 0 5px;
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
      padding-left: 10px;
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
