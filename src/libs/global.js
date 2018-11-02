import Vue from 'vue'

/**
 * 全局注册弱提示
 */
export default {
  install () {    
    Vue.prototype.$global = () => {
      let date = new Date();
      let year = date.getFullYear(),      //年
          month = date.getMonth()+1 > 9 ? date.getMonth()+1 : '0'+(date.getMonth()+1),    //月
          day = date.getDate()>9 ? date.getDate() : '0'+date.getDate(),   //日
          hours = date.getHours()>9 ? date.getHours() : '0'+date.getHours(),    //时
          minutes = date.getMinutes()>9 ? date.getMinutes() : '0'+date.getMinutes(),    //分
          seconds = date.getSeconds()>9 ? date.getSeconds() : '0'+date.getSeconds(),    //秒
          milliseconds = date.getUTCMilliseconds()>99 ? date.getUTCMilliseconds() : (date.getUTCMilliseconds()>9 ? '0'+date.getUTCMilliseconds() : '0'+'0'+date.getUTCMilliseconds()),    //毫秒
          randomNum = parseInt(Math.random()*100000000);  //八位随机数 
      return {
        'serialNumber': year+month+day+hours+minutes+seconds+milliseconds+randomNum,
        'timestamp': year+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds,
      }
    },
    Vue.prototype.src = (imgPath,Size) => {
      let imgUrl = imgPath != undefined ? imgPath.substring(0, imgPath.length - imgPath.split('.')[imgPath.split('.').length - 1].length - 1) + "_" + Size + "." + imgPath.split('.')[imgPath.split('.').length-1]:"";
      return imgUrl;
    }    
  }
}