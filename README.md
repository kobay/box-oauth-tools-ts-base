## 環境
- Nodeが使えるようにする
- グローバルにtypescriptを入れる
```shell
npm -g i typescript
```

## 使い方

1. このソースをローカルにClone。
```shell
git clone kobay/box-for-box
```
2. Boxで標準OAuth認証アプリを作る
   1. コールバック先は、`http://localhost:3000/callback` にする
   2. スコープなど適宜設定
3. `config.json` に clientIDとclientSecretを入れる
4. パッケージのインストール
```shell
# プロジェクトルートで
npm install
```
5. srcフォルダ以下に適当にtsコードを書く
6. `tsc`でts -> jsのコンパイルをする　（もしくは、`tsc -w` で監視して随時コンパイルをする） → 同じフォルダに同名のjsファイルが作られる
7. `node xxx.js` を実行する

