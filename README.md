# ホー博士のクイズ｜投稿ダッシュボード

iPhoneから「動画ダウンロード → 投稿文コピー → 各SNSへ投稿 → 完了チェック」を一画面で回す、サーバー不要の静的サイト（GitHub Pages 用）。

## 使い方（iPhone）
1. GitHub Pages の URL を Safari で開く
2. 共有ボタン →「ホーム画面に追加」でアプリ化（PWA）
3. **今日 投稿する動画**が自動でトップ表示
4. 〔⬇動画〕〔⬇サムネ〕で保存 → 〔📋YouTube/TikTok/Reels〕で投稿文をコピー
5. 各アプリで投稿
6. 〔YouTube / TikTok / Reels〕のボタンを押して **投稿済みを記録**（この端末に保存）

## GitHub Pages へ公開する手順
1. GitHub で新規リポジトリを作成（例: `quiz-dashboard`、Public）
2. この `site/` の中身をリポジトリ直下にアップロード（ドラッグ＆ドロップでOK）
3. Settings → Pages → Branch: `main` / `/ (root)` を選んで Save
4. 数分後に `https://<ユーザー名>.github.io/quiz-dashboard/` で公開

## 新しい動画を追加するには
1. `videos/` に動画、`thumbs/` にサムネを置く
2. `episodes.json` の `episodes` 配列に1件追加：
```json
{
  "id": "ep4",
  "title": "タイトル",
  "genre": "ジャンル",
  "scheduled": "2026-07-02T19:00",
  "video": "videos/ep4.mp4",
  "thumb": "thumbs/ep4.png",
  "ready": true,
  "captions": { "youtube": "…", "tiktok": "…", "instagram": "…" }
}
```
3. コミット → 自動で反映

## メモ
- 投稿ステータスは **その端末のブラウザ（localStorage）** に保存されます。
  複数端末で同期したい場合は Supabase / Google スプレッドシート連携に拡張可能。
- `ready: false` の回は「準備中」表示（動画・サムネ未登録でもスケジュールだけ管理可）。
