# 2025 Q3/Q4 農產品批發市場交易行情

原始 Observable 範例： https://observablehq.com/d/f3cada482df9cc7f@584

## 本機預覽

在專案根目錄啟動靜態伺服器後即可預覽：

~~~sh
npx http-server
~~~

## GitHub Pages 部署

此專案已包含 GitHub Pages 的部署工作流程，推送到預設分支後會自動部署。

1. 在 GitHub 專案的 **Settings → Pages** 中，將 **Build and deployment** 設為 **GitHub Actions**。
2. 推送到預設分支 (通常是 `main`) 後，Actions 會自動發佈到 GitHub Pages。

## 以 Observable Runtime 匯入

或使用 [Observable Runtime](https://github.com/observablehq/runtime) 將此模組匯入你的應用程式。To npm install:

~~~sh
npm install @observablehq/runtime@5
npm install https://api.observablehq.com/d/f3cada482df9cc7f@584.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "f3cada482df9cc7f";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~
