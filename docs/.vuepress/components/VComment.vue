<template>
  <div id="vcomment">

  </div>
</template>

<script>
const Valine = require('valine')
const AV = require('leancloud-storage')
export default {
    mounted:()=>{
        const valineOptions = {
        el: '#vcomment',
        placeholder: '理性发言',
        appId:"VLA81Yn1kDUEgE9A99Qwnb1u-gzGzoHsz",
        appKey:"CpivAcjiG4W9BWNpS2z47X98",
        path: window.location.pathname,
      }

      if (typeof window !== 'undefined') {
        window.AV = AV
      }

      new Valine(valineOptions)
    }
}
</script>

<style>

</style>