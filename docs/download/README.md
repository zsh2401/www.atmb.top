---
title: 下载秋之盒
---

<div class="download-hero">
  <h1>选择适合你的版本</h1>
  <p class="subtitle">两种方式，同样强大。管理你的 Android 设备，从这里开始。</p>
</div>

<div class="download-cards">

<div class="download-card web">
  <div class="card-badge">无需安装</div>
  <div class="card-icon">🌐</div>
  <h2>网页版</h2>
  <p class="card-desc">打开浏览器即刻使用。基于 WebUSB 技术，在浏览器中直接连接并管理你的 Android 设备。</p>
  <ul class="card-features">
    <li>零安装，即开即用</li>
    <li>跨平台，有浏览器就能用</li>
    <li>适合临时使用或快速操作</li>
  </ul>
  <a class="card-btn" href="https://app.atmb.top" target="_blank">立即使用 →</a>
</div>

<div class="download-card local">
  <div class="card-badge hot">推荐</div>
  <div class="card-icon">💻</div>
  <h2>本地版</h2>
  <p class="card-desc">基于 Tauri 技术构建的原生桌面应用，通过本地 ADB 驱动连接设备，功能更完整，体验更流畅。</p>
  <ul class="card-features">
    <li>完整功能，支持高级操作</li>
    <li>原生性能，轻量高效</li>
    <li>支持 Windows / macOS / Linux</li>
  </ul>
  <p class="card-coming">即将发布，敬请期待</p>
</div>

</div>

<div class="download-compare">
  <h3>版本对比</h3>
  <table>
    <thead>
      <tr><th></th><th>网页版</th><th>本地版</th></tr>
    </thead>
    <tbody>
      <tr><td>安装</td><td>无需安装</td><td>下载安装包</td></tr>
      <tr><td>设备连接</td><td>WebUSB</td><td>本地 ADB</td></tr>
      <tr><td>插件支持</td><td>✅</td><td>✅</td></tr>
      <tr><td>高级功能</td><td>部分</td><td>全部</td></tr>
      <tr><td>离线使用</td><td>❌</td><td>✅</td></tr>
      <tr><td>支持平台</td><td>Chrome 等现代浏览器</td><td>Windows / macOS / Linux</td></tr>
    </tbody>
  </table>
</div>

<style>
.download-hero {
  text-align: center;
  padding: 2rem 0 1rem;
}
.download-hero h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.download-hero .subtitle {
  font-size: 1.15rem;
  color: #666;
  margin: 0;
}

.download-cards {
  display: flex;
  gap: 1.5rem;
  margin: 2rem 0;
  justify-content: center;
  flex-wrap: wrap;
}

.download-card {
  position: relative;
  flex: 1;
  min-width: 260px;
  max-width: 380px;
  border: 2px solid #e8ecf1;
  border-radius: 16px;
  padding: 2rem 1.5rem 1.8rem;
  background: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
}
.download-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 152, 203, 0.15);
}
.download-card.local {
  border-color: #6698cb;
}

.card-badge {
  position: absolute;
  top: -12px;
  left: 20px;
  background: #e8ecf1;
  color: #555;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 12px;
  border-radius: 20px;
}
.card-badge.hot {
  background: #6698cb;
  color: #fff;
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.download-card h2 {
  font-size: 1.5rem;
  margin: 0.3rem 0 0.8rem;
  border-bottom: none;
}

.card-desc {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
}

.card-features {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}
.card-features li {
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: #444;
}
.card-features li::before {
  content: "✓ ";
  color: #6698cb;
  font-weight: 700;
}

.card-btn {
  display: inline-block;
  background: #6698cb;
  color: #fff !important;
  padding: 0.6rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: background 0.2s;
  margin-top: 0.5rem;
}
.card-btn:hover {
  background: #5580b0;
}

.card-coming {
  display: inline-block;
  background: #f0f4f8;
  color: #6698cb;
  padding: 0.6rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.download-compare {
  max-width: 680px;
  margin: 2rem auto;
}
.download-compare h3 {
  text-align: center;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}
.download-compare table {
  width: 100%;
  border-collapse: collapse;
}
.download-compare th,
.download-compare td {
  padding: 0.6rem 1rem;
  text-align: center;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}
.download-compare th {
  background: #f7f9fb;
  font-weight: 600;
}
.download-compare td:first-child {
  text-align: left;
  font-weight: 500;
  color: #333;
}

/* Dark mode */
.dark .download-hero .subtitle {
  color: #aab;
}
.dark .download-card {
  background: #1a1a2e;
  border-color: #2a2a3e;
}
.dark .download-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}
.dark .download-card.local {
  border-color: #6698cb;
}
.dark .card-badge {
  background: #2a2a3e;
  color: #aab;
}
.dark .card-desc {
  color: #aab;
}
.dark .card-features li {
  color: #ccd;
}
.dark .card-coming {
  background: #2a2a3e;
}
.dark .download-compare th {
  background: #1a1a2e;
  color: #ccd;
}
.dark .download-compare td {
  border-bottom-color: #2a2a3e;
  color: #aab;
}
.dark .download-compare td:first-child {
  color: #ccd;
}
</style>
