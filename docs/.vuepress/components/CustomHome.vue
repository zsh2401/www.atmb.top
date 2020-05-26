<template>
  <div class="c-home">
    <div class="header">
      <div style="text-align:center">
        <img class="atmb-icon" src="/images/icon.png"/>
        <h1 style="font-size: 60px">AutumnBox 2019.4</h1>
        <h4>开源、免费、易用的图形化ADB工具箱</h4>
        <router-link to="download/">立刻下载</router-link> /
        <router-link to="guide/">指南</router-link>
        <br />
        <br />
        <a href="https://github.com/zsh2401/AutumnBox/issues">提交建议与反馈</a> /
        <a target="_blank" href="https://github.com/zsh2401/AutumnBox">浏览源代码</a>
        <p>
          运行需求
          <br />Windows 7及以上 /
          <router-link to="download/env">.Net Framework 4.5.2</router-link>
        </p>
      </div>
    </div>
    <br />
    <Content />
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
.line {
  width: 100%;
  background-color: lightgray;
  height: 1px;
}
.atmb-icon {
  height: 20vh;
}
.header {
  min-height: 40vh;
  padding-top: 15vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
