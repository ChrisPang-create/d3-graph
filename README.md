# 2025Q3Q4 農產品批發市場交易行情視覺化

此專案使用 D3.js 讀取 `2025Q3Q4農產品批發市場交易行情.csv`，將交易量最高的前五名作物之主要批發市場均價，以折線圖呈現。

## 本機檢視

```sh
npx http-server
```

然後開啟 `http://localhost:8080`。

## GitHub Pages 部署

已內建 GitHub Actions workflow，推送到 `main` 或 `master` 分支後會自動部署到 GitHub Pages。

1. 在 GitHub 專案設定中啟用 Pages。
2. Source 選擇 **GitHub Actions**。
3. 等待 workflow 完成後即可透過 Pages 網址檢視。
