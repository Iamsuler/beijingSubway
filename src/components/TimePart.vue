<template>
  <div id="time">时间：{{ nowDate }}</div>
</template>

<script>
import { formatDate } from "../libs/formatDate.js";
export default {
  name: 'TimePart',
  data () {
    return {
      nowDate: '',
      timer: null
    }
  },
  mounted () {
    this.timer = setInterval(this.handlerClock, 1000)
  },
  methods: {
    handlerClock () {
      let now = new Date()
      this.nowDate = formatDate(now, 'yyyy-MM-dd HH:mm:ss')
    }
  }
}
</script>

<style lang="scss" scoped>
#time {
  padding-bottom: 16px;
  line-height: 24px;
  text-align: center;
  color: #666;
  font-size: 16px;
}
</style>
