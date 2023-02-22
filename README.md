# Misskey Now

<p align="center">
<img src="https://github.com/sasakulab/misskey-now/raw/main/assets/96x96.png"
	alt="Misskey Now" width="96" height="96" />
</p>

## これはなに

**\#now*do*ing** なノートを Misskey に投稿する Chrome 拡張機能です。

![#nowdoing](/img/nowdoing.png)

## インストール

以下の拡張機能プロバイダーから、お使いのブラウザにインストールしてください。

- [Chrome ウェブストア](https://chrome.google.com/webstore/detail/misskey-now/gaanhijofgiahpbmjelcfhccepcgbekh)
- [Firefox Browser ADD-ONS](https://addons.mozilla.org/ja/firefox/addon/misskey-now/)

Microsoft Edge は、"Chrome ウェブストア" からサイドロードできます。

## 初期設定

### 1. アクセストークンの発行

Misskey のアクセストークンが必要です。
**設定** » **API** から **アクセストークンの発行** を選択し、
**ノートを作成・削除する** 権限を持つトークンを発行してください。

![アクセストークンの発行](/img/accesstoken.png)

### 2. アクセストークンの設定

Misskey Now を表示し、
**Settings** を開いて表示される **API Key** の入力欄にトークンを貼り付けます。
**Host** の欄には所属しているインスタンスのホスト名
(misskey.io や misskey.dev など) を入力します。
最後に **Save Settings** をクリックして設定を保存します。

![アクセストークンの設定](/img/pastetoken.png)

### 3. 完璧！

ウェブページや動画を Misskey で共有しましょう！

## 関連ページ

[#nowwatching なウェブサイトを Misskey へ簡単に投稿する “Misskey Now” を開発しました](https://blog.sasakulab.com/tools/misskey-now)

## 審査用ファイルの生成

```sh
cd path/to/misskey-now/
zip -r -FS ../misskey-now.zip * --exclude '*.git*' 'README.md' '*img*'
```

## Contributor

この場を借りて厚く御礼申し上げます。

- [@KusaReMKN](https://kusaremkn.com/)
