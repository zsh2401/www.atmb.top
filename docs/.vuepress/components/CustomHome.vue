<template>
  <div class="header">
    <div class="header-content">
      <div>
        <p class="title">Autumn Box</p>
        <a href="https://pan.zsh2401.top">
          <button>下载</button>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    shouldShowComments() {
      return true;
    }
  }
};
</script>

<style scoped>
.header {
  background-image: url("/images/bg.png");
  height: 50vh;
  background-attachment: fixed;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.header-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.title {
  font-size: 70px;
  color: white;
}
</style>
<style lang="stylus" scoped>
.comments-wrapper {
  padding: 2rem 2rem 2rem 22rem;
  max-width: 740px;
  margin: 0 auto;
}

@media (max-width: $MQNarrow) {
  .theme-container.no-sidebar {
    .comments-wrapper {
      padding-left: 2rem;
    }
  }

  .comments-wrapper {
    padding-left: 18.4rem;
  }
}

@media (max-width: $MQMobile) {
  .comments-wrapper {
    padding-left: 2rem;
  }
}
</style>
