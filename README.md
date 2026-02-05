# Minimalist Note Editor

This project is a clean, distraction-free note-taking application built with React. It's designed for writers and developers who need a simple interface to quickly structure thoughts using markdown-like symbols and semantic HTML tags.

## Project Scan Sheet

| Category | Details |
| :--- | :--- |
| **Framework** | React 18.2.0 (ESM via `importmap`) |
| **Styling** | CSS-in-JS (JS Objects), Semantic Design Tokens |
| **Animation** | Framer Motion |
| **Typography** | Inter (UI), Victor Mono (Editor) |
| **Icons** | Phosphor Icons (Web Component) |
| **State Management** | React Context (`Theme`, `Breakpoint`), Local State |
| **Architecture** | Component-based: `Core` → `Section` → `Page` |
| **Key Components** | Full-page Text Area, Bottom Action Panel |
| **Theme System** | Light/Dark Modes, Responsive Tokens |

## What's Inside? (ELI10 Version)

Imagine you have a magical piece of paper that's super clean and easy to write on. This app is like that paper!

-   **`index.html`**: The front door to our app.
-   **`index.tsx`**: The main brain of the app.
-   **`importmap.js`**: A map that tells our app where to find its tools (like React).
-   **`Theme.tsx`**: The "master closet" for our app's style (colors, fonts, etc.).
-   **`components/`**: The LEGO pieces themselves.
    -   **`Core/`**: The most basic pieces (like the `ActionButton`).
    -   **`Section/`**: A whole section of the app (the `ActionPanel` at the bottom).
    -   **`Page/`**: A full screen you see (the `NoteEditor` page).

## Directory Tree

```
.
├── components/
│   ├── Core/
│   │   ├── ActionButton.tsx (repurposed DockIcon.tsx)
│   │   ├── StateLayer.tsx
│   │   └── ThemeToggleButton.tsx
│   ├── Page/
│   │   └── NoteEditor.tsx (repurposed Welcome.tsx)
│   └── Section/
│       ├── ActionPanel.tsx (repurposed Dock.tsx)
│       └── SymbolTray.tsx
├── hooks/
│   └── useBreakpoint.tsx
├── README.md
├── LLM.md
├── noteBook.md
├── bugReport.md
├── Theme.tsx
├── importmap.js
├── index.html
├── index.tsx
├── metadata.json
```

## How to Get Started

1.  Open the `index.html` file in a modern web browser.
2.  Start typing!
3.  Use the action panel at the bottom to insert structural elements.