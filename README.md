# 📰 Hacker News

[![Netlify Status](https://api.netlify.com/api/v1/badges/2d14f0ec-0a88-4b12-9d77-b0630f7e5304/deploy-status)](https://app.netlify.com/projects/hackernews-rtk-thunk/deploys)

A Hacker News front-end built with React, TypeScript, Redux Toolkit, CSS, and Vite that fetches live data from the [Hacker News API](https://github.com/hackernews/api). Supports `Top`, `Best`, and `New` story feeds with pagination, client-side caching, and navigation via URL query parameters.

This project was created to gain hands-on experience with asynchronous state management using [Redux Toolkit](https://redux-toolkit.js.org/) and [createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk).

Live demo: https://hackernews-rtk-thunk.netlify.app/

## ✨ Features

### 📡 Feed & Filtering
- Browse stories by **Top**, **Best**, or **New** feed
- Switching feeds immediately triggers a fresh fetch of up to **500 (Top/Best)** or **200 (New)** story IDs
- Stories are displayed **20 per page**

### ⚡ Caching
- Each story is fetched **only once** per session and stored in the Redux state
- Navigating back to a previously visited page or feed returns **instantly** — no redundant network requests
- Only stories not yet in the cache are fetched when switching pages or feeds

### 🔗 URL-Driven Navigation
- Feed type and page number are stored as **query parameters** (`?feed=top&page=2`)
- Supports full browser **back / forward** navigation
- Reloading the page preserves your current position

### 📄 Pagination
- Navigate between pages using `<<` (first), `<` (previous), `>` (next), and `>>` (last) buttons
- Changing pages does **not** re-fetch story IDs — IDs are fetched only on initial load or when switching feeds

### 🌐 Favicons
- Each story displays the **favicon** of its source domain, fetched via the [DuckDuckGo](https://duckduckgo.com/) favicon API:
  ```
  https://icons.duckduckgo.com/ip3/{hostname}.ico
  ```

### 🕐 Relative Timestamps
- Story timestamps are shown in human-readable format using [dayjs](https://github.com/iamkun/dayjs):  
  e.g. `"5 minutes ago"`, `"21 hours ago"`, `"2 days ago"`

## 📦 API

Data is sourced from the official [Hacker News API](https://github.com/hackernews/api).

The fetch flow works in two stages:

1. **Fetch story IDs** — A single request retrieves an ordered list of IDs for the selected feed (`/topstories`, `/beststories`, or `/newstories`)
2. **Fetch individual stories** — Only the stories needed for the current page are fetched, each via its own request (`/item/{id}`)

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/astik-dev/hackernews-rtk-thunk.git
cd hackernews-rtk-thunk

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for production

```bash
npm run build
```
