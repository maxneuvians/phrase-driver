# Phrase Driver

Phrase Driver is a web application that helps users practice French vocabulary by writing sentences using given words or phrases. The app evaluates user sentences using a Large Language Model (LLM) and provides corrections and explanations.

## Features
- Choose vocabulary categories (nouns, etc.) and practice with random words.
- Select additional criteria: tense, negation, interrogative, imperative.
- Enter a sentence using the given word/phrase.
- Sentences are evaluated by an LLM (e.g., GPT-4o via GitHub Copilot API).
- Corrections and explanations are shown; users must acknowledge changes and retype the corrected sentence.
- Results are saved to a local SQLite database.

## Project Structure
```
phrase-driver/
├── backend/
│   ├── index.js              # Express server entry point
│   ├── controllers/          # Route controllers (evaluation, results)
│   ├── models/               # DB and Copilot LLM integration
│   ├── routes/               # Express routers
│   ├── data/
│   │   ├── nouns.csv         # Example vocabulary CSV
│   │   └── phrasedriver.db   # SQLite DB (gitignored)
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx           # Main React app
│       ├── api.js            # API utility functions
│       ├── index.css         # App styles
│       └── main.jsx
├── .github_copilot_token     # (Not in repo) Copilot access token (gitignored)
├── .gitignore
└── README.md
```

## Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm
- A valid `.github_copilot_token` file in the project root (not in repo)

### Backend
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start the backend server:
   ```bash
   node index.js
   ```
   The server runs on port 3000 by default.

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:5173 (or the port shown in the terminal).

## LLM Integration
- The backend uses the GitHub Copilot API to evaluate sentences.
- The `.github_copilot_token` file must contain a valid Copilot access token.
- The backend manages session tokens and calls the LLM for each evaluation request.

## Data
- Vocabulary is loaded from CSV files in `backend/data/` (e.g., `nouns.csv`).
- Results are saved in a local SQLite database (`phrasedriver.db`).

## Development Notes
- All sensitive files (tokens, DB) are gitignored.
- The backend and frontend are decoupled and communicate via REST API.
- The UI is built with React and styled for clarity and usability.

## License
MIT
