# BililiveRecorder-WebUI

给 BililiveRecorder.Cli 添加一个简单的网页界面。分为两个版本，嵌入版和群控版。

嵌入版会在 BililiveRecorder.Cli 打包时嵌入到 BililiveRecorder.Cli 中，特征为只能控制本机，无法添加录播姬。

群控版允许用户自助添加控制任意数量的录播姬，

## 常见问题：

1、怎么手动更新内嵌的版本？

一般情况下会跟随 BililiveRecorder.Cli 的更新，但如果你看上某个测试版本了，你可以到[Github Actions](https://github.com/BililiveRecorder/BililiveRecorder-WebUI/actions)中选择相应的构建，然后再 Artifacts 中下载 dist-embedded，并解压到 BililiveRecorder.Cli 的 wwwroot/ui 目录下（没有就自己创建）。

2、为什么我在 https://webui.rec.danmuji.org/ 连不到我的录播姬？

主要有两种原因：

(1) HTTPS 无法访问 HTTP 的内容，此题无解，您可以尝试自己部署一个

(2) 请确认您是否能直接打开该网址，如果不行，请检查端口映射及开放端口。

3、我想自己部署一个 webui 群控版可以吗？

可以的，我们提供预配置好的 docker 镜像，您可以自己部署。

```
docker run -d -p 3000:80 --name="webui" ghcr.io/bililiverecorder/bililiverecorder-webui:master
```

如果你想自己用其他部署的方式，请注意该应用是 SPA，因此需要注意路由问题。

这里有一份 nginx 的配置，仅供参考 [default.conf](https://raw.githubusercontent.com/BililiveRecorder/BililiveRecorder-WebUI/master/.github/default.conf)

## 开发

### Structure

Vue3 + Typescript + Vite + Naive-UI

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=vue.volar)

### 调试运行

`npx vite` 或 `npm run dev`

### 构建

```
npm run build
```

不想和 typescript 打架时可以

```
npx vite
```
