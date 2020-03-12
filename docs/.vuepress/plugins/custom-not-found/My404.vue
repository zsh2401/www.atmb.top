<template>
  <div class="theme-container">
    <div class="text-center">
      <img style="width:100px" src="/favicon.ico" />
      <h1>404 NOT FOUND</h1>
      <h3>页面似乎被转移了?</h3>
      <router-link to="/">回到主页 ({{lastSec}})</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data: () => {
    return { lastSec: 10 };
  },
  mounted() {
    // console.log(this.$router);
    var interval = setInterval(() => {
      if (this.lastSec > 0) {
        this.lastSec--;
      } else {
        clearInterval(interval);
        if (this.$router.currentRoute.path !== "/") {
          this.$router.push("/");
        }
      }
    }, 1000);
  }
};
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>