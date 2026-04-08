# Interactive Wall Calendar Component

This is my frontend challenge project.
I built a wall style interactive calendar with date range selection and notes.

## What Is Implemented

- Wall calendar style layout
- Hero image section on top of calendar
- Start and end date range selection
- Visual states for start, end, and in-range days
- Notes panel for month memo, day notes, and range events
- Responsive layout for desktop and mobile
- Local storage persistence (frontend only)

## Tech Stack

- React
- Vite
- CSS Modules
- Context API with useReducer
- localStorage

## Run Local

```bash
cd calendar-app
npm install
npm run dev
```

Open:

http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages Deploy

This project is configured for GitHub Pages.

Option 1: GitHub Actions (recommended)

1. Push code to main branch.
2. Open repository settings on GitHub.
3. Go to Pages and set source to GitHub Actions.
4. Workflow will build and deploy automatically.

Option 2: Manual deploy command

```bash
npm run deploy
```

## Submission Checklist

- Source code in public repo
- Video demo link added in submission
- Live demo link from GitHub Pages

## Folder Structure

```text
src/
  App.jsx
  App.css
  index.css
  main.jsx
  components/
  context/
```
