# Musche — From creation to credits

新版完整工作流宣传片：57.6 秒，100 BPM 原创配乐，1920×1080，60 fps。

成片：`Musche-Workflow-Film-1080p60.mp4`。

按顺序展示 Library 资料创建、New Task、任务池拖入日程、时长与安排倍率同步变化、EDIT、Session 切换、Credits 生成及复制。项目、乐器、人员分别使用 Project A/B、Instrument A/B、Player A/B。

日程块采用连续插值，时长与倍率由同一进度计算；倍率为安排时长除以曲目时长。数字使用连续滚动，不按60/75/90分钟三张截图切换。真实产品检查点为03:00曲目对应60分钟×20.0、75分钟×25.0、90分钟×30.0。

`film.html` 是可播放、可拖动进度的源预览。静态资源与 manifest 已打包进 `film-data.js`，可直接打开本地 HTML。所有产品素材在隔离浏览器内使用虚构示例数据捕获，应用代码未修改。

## 重现

```sh
npm run dev -- --host 127.0.0.1 --configLoader runner
node promo/launch-film/capture-library.mjs
node promo/launch-film/capture-workflow.mjs
node promo/launch-film/prepare.mjs
node promo/launch-film/render.mjs --stills
node promo/launch-film/render.mjs
```

可选原生 4K 渲染：`node promo/launch-film/render.mjs --4k`。

`assets-v2/` 包含真实界面的高分辨率组件、原始坐标和真实交互状态。`audio/musche-score-v2-master.wav` 是57.6秒的48kHz/24-bit立体声母带；原版48秒配乐和源动画保留。节拍与分镜见 `storyboard-v2.md` 和 `audio/beat-map-v2.json`。
