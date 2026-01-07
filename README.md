# 2025Q3Q4 農產品批發市場交易行情

這是一個使用 D3 的堆疊面積圖專案，視覺化 2025 年第三、四季農產品批發市場交易量。

## 本機預覽

在此資料夾啟動簡單的靜態網站伺服器即可瀏覽：

~~~sh
npx http-server
~~~

## GitHub Pages 部署

此專案已提供 GitHub Actions 的 Pages 部署流程，推送到 `main` 分支後會自動發布。請在 GitHub 專案設定中啟用 Pages（來源選擇 GitHub Actions）。

## Observable Runtime

若要將此模組直接引入其他應用，可使用 [Observable Runtime](https://github.com/observablehq/runtime)：

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
