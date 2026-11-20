# Workspace Agent Rules — Interactive Math Book (`BOOK`)

## 1. GitHub & Google AI Studio Sync Protocol (Conflict Prevention)

This repository (`omarabotrad97/interactive-math-book`, branch `main`) is worked on from both this local workspace and **Google AI Studio**. To prevent merge conflicts and lost edits:

1. **Always check & sync before editing locally:**
   - Before modifying any project file, run `git fetch origin && git status -sb`.
   - Check `git rev-list --left-right --count HEAD...origin/main`.
   - If `origin/main` has new commits (`0 <behind>`), pull cleanly (`git pull --ff-only origin main`) before starting edits. If there are uncommitted local changes that conflict with `origin/main`, stop and ask the user how to reconcile them first.
2. **One side at a time:**
   - Never make concurrent edits in Google AI Studio and locally without syncing via GitHub `main` in between.
   - After pushing local commits to `origin/main`, explicitly remind the user to click **GitHub -> Pull changes to Google AI Studio** inside Google AI Studio before editing there.
3. **Protect deployment & monorepo files:**
   - Never delete or overwrite `.github/workflows/deploy-pages.yml`, `.gitignore`, `README.md`, `LICENSE`, or `book-mobile/` when merging updates.
4. **GitHub Pages compatibility:**
   - Every `push` to `main` touching `index.html`, `js/**`, or `styles/**` automatically deploys the static web app to `https://omarabotrad97.github.io/interactive-math-book/` via `.github/workflows/deploy-pages.yml`.
   - Keep frontend asset references in `index.html`, `js/`, and `styles/` relative (avoid leading `/` paths for static assets so subpath hosting works cleanly).
   - Keep `js/features/ai-tutor.js` resilient when `/api/ai/*` backend routes are unavailable on static GitHub Pages.

## 2. Mobile-First & Arabic RTL Skill

- When modifying or reviewing any UI, HTML, CSS, or interactive learning view in this workspace, read and follow `.agents/skills/mobile-first-education/SKILL.md`.
