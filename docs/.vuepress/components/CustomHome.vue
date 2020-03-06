<template>
  <div class="c-home">
    <div class="header">
      <div style="text-align:center">
        <img class="atmb-icon" src="/images/icon.png" />
        <h1 style="font-size: 60px">AutumnBox 2019.4</h1>
        <h4>开源、免费、易用的图形化ADB工具箱</h4>
        <a class="link" href="download/">立刻下载</a> /
        <a class="link" href="dev/os/">浏览源代码</a> /
        <a class="link" href="guide/">指南</a>
        <p>
          运行需求
          <br />Windows 7及以上 / .Net Framework 4.6.1
        </p>
      </div>
    </div>
    <br />

    <Content/>
    <!-- <div class="c-home-row ca">
      <div>
        <h3>秋之盒值得被您信任</h3>
        <ul>
          <li>使用C#和WPF技术编写,遵守Windows API规范</li>
          <li>
            <img
              src="https://img.shields.io/badge/%E5%BC%80%E6%BA%90%E8%AE%B8%E5%8F%AF-LGPL3.0-brightgreen.svg"
            />
          </li>
          <li>
            <a
              target="_blank"
              href="http://r.virscan.org/language/zh-cn/report/67dda3a561124fe6c0818cfe32da9f9f"
            >
              <img
                src="https://img.shields.io/badge/%E5%85%A8%E7%90%83%E6%9F%A5%E6%9D%80-安全-brightgreen.svg"
              />
            </a>
          </li>
          <li>
            <a target="_blank" href="https://habo.qq.com/file/showdetail?pk=ADQGb11vB2QIOls5U2A%3D">
              <img
                src="https://img.shields.io/badge/%E8%85%BE%E8%AE%AF%E5%93%88%E5%8B%83-%E6%9C%AA%E5%8F%91%E7%8E%B0%E9%A3%8E%E9%99%A9-brightgreen.svg"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>-->
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
.line{
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
