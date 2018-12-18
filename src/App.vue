<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style lang="scss">
#app {
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  color: #333;
}

.btn-wrap {
  .btn {
    width: 52px;
    height: 24px;
    line-height: 22px;
    text-align: center;
    background-color: #fff;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    cursor: pointer;

    &:not(:last-child) {
      margin-right: 5px;
    }

    &:disabled {
      cursor: default;
      background-color: #dedede;
    }
  }
}
</style>
