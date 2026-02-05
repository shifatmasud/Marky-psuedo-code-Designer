# Minimalist Note Editor

This project is a clean, distraction-free note-taking application built with React. It's designed for writers and developers who need a simple interface to quickly structure thoughts. The editor features an intuitive inline command menu; simply type `/` to access a list of symbols and formatting tags. Your notes are automatically saved in your browser, so you can pick up where you left off.

**NEW: Formatting Toolbar** - Select any text to bring up a floating toolbar, allowing you to quickly apply **bold**, *italic*, or __underline__ formatting.

## Project Scan Sheet

| Category | Details |
| :--- | :--- |
| **Framework** | React 18.2.0 (ESM via `importmap`) |
| **Styling** | CSS-in-JS (JS Objects), Semantic Design Tokens |
| **Animation** | Framer Motion |
| **Typography** | Inter (UI), Victor Mono (Editor) |
| **Icons** | Phosphor Icons (Web Component) |
| **State Management** | React Context (`Theme`, `Breakpoint`), Local State |
| **Architecture** | Component-based: `Core` → `Package` → `Page` |
| **Key Components** | Full-page Text Area, Inline Command Menu, Selection Toolbar |
| **Theme System** | Light/Dark Modes, Responsive Tokens |

## What's Inside? (ELI10 Version)

Imagine you have a magical piece of paper that's super clean and easy to write on. This app is like that paper!

-   **`index.html`**: The front door to our app.
-   **`index.tsx`**: The main brain of the app.
-   **`importmap.js`**: A map that tells our app where to find its tools (like React).
-   **`Theme.tsx`**: The "master closet" for our app's style (colors, fonts, etc.).
-   **`components/`**: The LEGO pieces themselves.
    -   **`Core/`**: The most basic pieces (like the `ThemeToggleButton`).
    -   **`Package/`**: A bundle of pieces forming a feature (the `/` `CommandMenu` or the new `SelectionToolbar`).
    -   **`Page/`**: A full screen you see (the `Welcome` page).

## Directory Tree

```
.
├── components/
│   ├── Core/
│   │   ├── StateLayer.tsx
│   │   └── ThemeToggleButton.tsx
│   ├── Package/
│   │   ├── CommandMenu.tsx
│   │   └── SelectionToolbar.tsx
│   └── Page/
│       └── Welcome.tsx
├── hooks/
│   └── useBreakpoint.tsx
├── utils/
│   └── caretPosition.ts
├── README.md
├── LLM.md
...
```

## How to Get Started

1.  Open the `index.html` file in a modern web browser.
2.  Start typing! Your work is saved automatically.
3.  Type `/` to open the command menu and insert structural elements.
4.  Select text to open the formatting toolbar.