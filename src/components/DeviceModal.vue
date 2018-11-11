<template>
    <div class="modal" v-show="isShowDetailModal">
        <div class="modal-body devide-detail">
            <h3 class="title">电梯设备信息</h3>
            <div class="device-detail-table">
                <div class="device-detail-col">
                    <p>序号：{{deviceInfo.no}}</p>
                    <div class="device-detail-wrap">
                        <h4>位置信息</h4>
                        <ul class="device-detail-list">
                            <li><span>运营公司：</span><span>{{deviceInfo.location.operator}}</span></li>
                            <li><span>项目部：</span><span>{{deviceInfo.location.department}}</span></li>
                            <li><span>线路：</span><span>{{deviceInfo.location.line}}</span></li>
                            <li><span>车站：</span><span>{{deviceInfo.location.station}}</span></li>
                            <li><span>ISCS编号：</span><span>{{deviceInfo.location.iscsNo}}</span></li>
                        </ul>
                    </div>
                    <div class="device-detail-wrap">
                        <h4>维保信息</h4>
                        <ul class="device-detail-list">
                            <li><span>使用单位：</span><span>{{deviceInfo.maintenance.company}}</span></li>
                            <li><span>维保单位：</span><span>{{deviceInfo.maintenance.maintainer}}</span></li>
                            <li><span>监管单位：</span><span>{{deviceInfo.maintenance.superviser}}</span></li>
                            <li><span>维保周期（天）：</span><span></span></li>
                        </ul>
                    </div>
                </div>
                <div class="device-detail-col">
                    <p></p>
                    <div class="device-detail-wrap">
                        <h4>注册信息</h4>
                        <ul class="device-detail-list">
                            <li><span>注册代码：</span><span>{{deviceInfo.registration.code}}</span></li>
                            <li><span>所属区县：</span><span>{{deviceInfo.registration.location}}</span></li>
                            <li><span>内部编号：</span><span>{{deviceInfo.registration.innerNo}}</span></li>
                            <li><span>安装合同编号：</span><span>{{deviceInfo.registration.contractNo}}</span></li>
                            <li><span>品牌：</span><span>{{deviceInfo.registration.brand}}</span></li>
                            <li><span>生产厂：</span><span>{{deviceInfo.registration.manufacturer}}</span></li>
                            <li><span>规格型号：</span><span>{{deviceInfo.registration.model}}</span></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="device-comment">
                <p>备注</p>
                <p>{{deviceInfo.name}}</p>
            </div>
            <div class="device-drawing" v-if="deviceInfo.transformType === 'A'">
                <span class="link" @click="openLink(deviceInfo.blueprintUrl)">设备概貌图</span>
            </div>

            <div class="icon-close" @click="closeModal"></div>
        </div>
    </div>
</template>

<script>
export default {
  name: "DeviceModal",
  data() {
    return {
      isShowDetailModal: false,
      deviceInfo: {
        location: {},
        maintenance: {},
        registration: {}
      },
      deviceId: ""
    };
  },
  methods: {
    closeModal() {
      this.isShowDetailModal = false;
    },
    getDeviceInfo() {
      let data = {
        serialNumber: this.$global().serialNumber,
        data: {
          deviceNo: this.deviceId
        }
      };
      this.$post("/subway/device_info", data).then(res => {
        console.log(res);
        if (res.code === "success") {
          let data = res.data
          data.location = data.location === null ? {} : data.location
          data.maintenance = data.maintenance === null ? {} : data.maintenance
          data.registration = data.registration === null ? {} : data.registration
          this.deviceInfo = data;
          this.isShowDetailModal = true;
        } else {
          alert(res.message);
        }
      });
    },
    openLink(url) {
      window.location.href = url;
    },
    showDeviceModal(id) {
      if (this.deviceId == id) {
        this.isShowDetailModal = true;
      } else {
        this.deviceId = id;
        this.getDeviceInfo();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.icon-close {
  background: url(../assets/icon_close.png) center center / 24px 24px no-repeat;
}

.devide-detail {
  position: relative;
  width: 500px;
  min-height: 400px;
  padding: 22px 0 10px 40px;
  border: 6px solid rgba(43, 50, 71, 0.3);
  border-radius: 4px;
  background-color: #fff;

  > .title {
    font-size: 16px;
    text-align: center;
    margin-bottom: 30px;
  }

  > .device-detail-table {
    display: flex;
    font-size: 13px;

    > .device-detail-col {
      width: 50%;
      padding-right: 40px;

      > p {
        height: 20px;
        line-height: 20px;
        margin-bottom: 20px;
      }

      > .device-detail-wrap {
        > h4 {
          font-weight: normal;
          margin-bottom: 5px;
        }

        > .device-detail-list {
          color: #999;
          line-height: 18px;
          margin-bottom: 20px;
          word-break: break-all;

          > li {
            display: flex;
            margin-bottom: 5px;

            > span {
              &:first-child {
                white-space: nowrap;
              }
            }
          }
        }
      }
    }
  }

  > .device-comment {
    display: flex;
    margin-bottom: 20px;

    > p {
      color: #999;

      &:first-child {
        color: #333;
        min-width: 40px;
      }
    }
  }

  > .device-drawing {
    > .link {
      display: block;
      width: 85px;
      height: 30px;
      line-height: 28px;
      margin: 0 auto;
      text-align: center;
      background: #f5f5f5;
      border: 1px solid #ccc;
      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.1);
      border-radius: 2px;
      cursor: pointer;
    }
  }

  .icon-close {
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 1000;
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
}
</style>
