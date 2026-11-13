# Helpdesk Call Sentiment Analysis

**Project statement:** Sentiment Analysis of Incoming Calls on Helpdesk  
**Organisation:** Ministry of Commerce and Industries  
**Problem-statement year:** 2023  
**Project type:** Software  
**Team size:** 3

## 1. Project overview

A small web application that helps a helpdesk operator review the sentiment of a customer conversation. The operator can start a **simulated call** using the browser microphone or paste a transcript manually. The application analyses the transcript, labels it Positive, Neutral, or Negative, shows the score and matched sentiment words, and stores the result in PostgreSQL for the call-history dashboard.

This is a classroom MVP, not a production call-centre platform. It does **not** connect to a phone network, record telephone calls, identify speakers, or infer emotion from vocal pitch. Microphone input is a browser-based demonstration of a spoken customer conversation.

## 2. MVP features

1. Dashboard with total calls and positive / neutral / negative counts.
2. Start and stop a simulated microphone call.
3. Live transcript display when browser speech recognition is available.
4. Manual transcript entry as a reliable fallback.
5. Server-side sentiment analysis with a small, explainable English word lexicon.
6. Sentiment label, integer score, and matched words for each transcript.
7. Save each analysed transcript and result in PostgreSQL.
8. Call-history table showing date, source, sentiment, score, and a short transcript preview.

### Explicitly out of scope

- Real phone/VoIP/SIP/PSTN integration.
- Uploading or storing raw audio files.
- Voice-pitch/acoustic emotion recognition.
- Training a machine-learning model or claiming model confidence/probability.
- Customer accounts, authentication, role management, billing, or deployment infrastructure.
- Complex analytics, AI summaries, multi-language translation, or third-party paid APIs.

The sentiment module is a **lexicon-based baseline**. It is useful for demonstrating the end-to-end workflow and is easy to explain, but it can miss sarcasm, context, mixed sentiment, and domain-specific language. Do not describe it as a trained deep-learning model.

## 3. Technology stack

- **Frontend:** React + JavaScript + Vite + HTML/CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Speech input:** Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) where supported
- **Sentiment analysis:** A small server-side JavaScript lexicon and scoring function

No TypeScript, Next.js, Tailwind CSS, Python service, Docker, camera controls, key-blocking, or unrelated IPC features are required for this MVP.

## 4. Proposed minimal folder structure

```text
helpdesk-call-sentiment/
├── client/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── speech.js
│       └── styles.css
├── server/
│   ├── package.json
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   │   └── calls.js
│   ├── sentiment/
│   │   ├── analyzer.js
│   │   ├── analyzer.test.js
│   │   └── lexicon.js
│   └── schema.sql
├── private-notes/              # local viva notes; ignored by Git
│   ├── akshit-viva.md
│   ├── parth-viva.md
│   └── prithviraj-viva.md
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── thoughts.md
├── task.md
└── IDE_PROMPT.md
```

Keep this structure unless a concrete requirement makes another file necessary. Do not generate a large layered architecture, services directory, Redux store, ORM, microservices, or elaborate test framework.

## 5. Data model

One PostgreSQL table is enough for this submission:

| Column | Type | Purpose |
|---|---|---|
| `id` | identity / primary key | Unique call record |
| `transcript` | text, not null | Recognised or manually entered text |
| `source` | text with allowed values `microphone` or `manual` | How the transcript entered the app |
| `sentiment` | text with allowed values `positive`, `neutral`, `negative` | Classification |
| `score` | integer | Lexicon score; not a probability |
| `matched_terms` | text array or JSON | Words that affected the score |
| `created_at` | timestamp with time zone | Record creation time |

Do not store customer phone numbers, names, or real customer data in this classroom MVP.

## 6. API contract

Before integration, Akshit and Prithviraj agree on these API contracts. Before backend integration, Akshit and Parth agree on the sentiment module input and output contract. Keep the agreed interfaces documented here and in `thoughts.md`.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check that the API is running |
| `POST` | `/api/calls` | Validate transcript, analyse it, save the result, and return the saved record |
| `GET` | `/api/calls` | Return the latest call records (limit the result, e.g. 100) |
| `GET` | `/api/stats` | Return total and positive / neutral / negative counts |

`POST /api/calls` request body:

```json
{
  "transcript": "The service was helpful, but the delivery was late.",
  "source": "manual"
}
```

The server calls Parth's `analyzeSentiment(text)` implementation and persists its result. A successful response is HTTP 201 and contains the saved record, including PostgreSQL-generated `id` and `created_at`:

```json
{
  "id": "1",
  "transcript": "The agent was good, helpful and excellent.",
  "source": "manual",
  "sentiment": "positive",
  "score": 3,
  "matched_terms": ["good", "helpful", "excellent"],
  "created_at": "2026-11-13T09:24:35.044Z"
}
```

Common errors use `{ "error": "<code>" }`: HTTP 400 for missing, blank, non-string transcripts, invalid sources, or malformed JSON; HTTP 502 for an invalid analyzer result; and HTTP 500 for unexpected server or database errors. The health route returns HTTP 503 when PostgreSQL is unavailable. The score is an integer polarity score, not a probability.

`GET /api/health` returns HTTP 200 with `{ "status": "ok", "express": "running", "database": "connected" }` when both Express and PostgreSQL are available. If the database check fails, it returns HTTP 503 with `{ "status": "error", "express": "running", "database": "unavailable" }`.

`GET /api/calls` returns a JSON array of saved call records, newest first, limited to 100. It returns `[]` when there are no saved calls. Each record includes `id`, `transcript`, `source`, `sentiment`, `score`, `matched_terms`, and `created_at`.

`GET /api/stats` response shape:

```json
{
  "total": 1,
  "positive": 0,
  "neutral": 0,
  "negative": 1
}
```

The numbers above are illustrative only. Keep API field names consistent across all three branches.

**Sentiment module integration contract:** Parth exposes `analyzeSentiment(text)` to the backend. It returns `{ sentiment, score, matched_terms }`, where `score` is an integer lexicon polarity score, not a probability or confidence percentage. Akshit imports and calls this module; Parth and Akshit agree on the input and final output shape before integration. Keep any agreed contract change documented here.

## 7. Run locally

The IDE should create the package files and implement the commands below. These are the intended commands; update them only if the generated package scripts differ.

1. Install Node.js and PostgreSQL.
2. Create a database named `helpdesk_sentiment` using pgAdmin or the PostgreSQL terminal:

   ```sql
   CREATE DATABASE helpdesk_sentiment;
   ```

3. Copy `.env.example` to `server/.env`. Set either `DATABASE_URL` or the `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` values. Set `PORT=5001` for the backend. Optional pool settings are `PGPOOL_MAX`, `PGPOOL_IDLE_TIMEOUT_MS`, and `PGPOOL_CONNECTION_TIMEOUT_MS`.
4. Run `server/schema.sql` against `helpdesk_sentiment` using pgAdmin Query Tool or:

   ```bash
   psql -d helpdesk_sentiment -f server/schema.sql
   ```

5. Install root, client, and server dependencies as specified by their package files.
6. Start the backend with `npm run dev --prefix server` and the frontend with `npm run dev --prefix client`. Alternatively, use `npm run dev` at the project root to start both.
7. Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

Expected local ports: frontend `5173`, backend `5001`. The Vite development server forwards relative `/api` requests to Express on port `5001`. The browser must have microphone permission for the simulated-call feature. Manual transcript entry must still work when speech recognition is unavailable or permission is denied.

Run Parth's sentiment unit tests with `npm test --prefix server`. For API integration tests, create a dedicated test database (for example, `createdb helpdesk_sentiment_test`) and run `TEST_DATABASE_URL=postgresql:///helpdesk_sentiment_test npm run test:api --prefix server`. The integration suite refuses database names that do not end in `_test` and cleans only rows it inserted.

## 8. Speech-recognition and privacy note

Browser `SpeechRecognition` support varies. Some browsers use a server-based recognition service, which means speech may be sent to that service and recognition may not work offline. The interface must show a clear microphone/privacy notice before starting. It must also provide manual transcript input. Use only team-created or synthetic demonstration conversations; do not upload or process real customer calls without appropriate consent and authorisation.

Reference: [MDN — SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) and [MDN — Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API).

## 9. Production deployment preparation

The app is configured for a separately hosted React frontend and Express API. The frontend can use `VITE_API_BASE_URL` (including the `/api` suffix) to call the deployed API; when unset, it uses the relative `/api` path through the local Vite proxy. The backend binds to `HOST` and `PORT`; local defaults are `127.0.0.1` and `5001`. Set `FRONTEND_ORIGIN` to the exact deployed frontend origin to allow browser requests from that site. Other origins do not receive CORS permission.

Suggested provider settings, pending provider accounts and database provisioning:

| Service | Setting |
|---|---|
| Vercel frontend root | `client` |
| Vercel install command | `npm ci` |
| Vercel build command | `npm run build` |
| Vercel output directory | `dist` |
| Vercel public environment variable | `VITE_API_BASE_URL=https://<backend-host>/api` |
| Render backend root | `server` |
| Render install/build command | `npm ci` |
| Render start command | `npm start` |
| Render backend environment | `HOST=0.0.0.0`, platform-provided `PORT`, `DATABASE_URL=<managed PostgreSQL URL>`, `FRONTEND_ORIGIN=https://<frontend-host>` |

Apply `server/schema.sql` once to the managed database using a secure provider connection before testing the deployed API. Keep the database URL in the backend's private environment settings; never add it to the Vite environment. The hosted app is not considered deployed until provider setup, health, persistence, and browser workflows are verified. No live frontend or backend URL is published in this repository yet.

## 10. Team ownership and repository details

The repository URL is [github.com/aks662/Sentiment-Analyzer](https://github.com/aks662/Sentiment-Analyzer).

| Member | Assigned work | Branch | Commits |
|---|---|---|---:|
| Akshit Rana | Express.js backend, PostgreSQL, REST APIs, validation and database operations | `feature/akshit-rana` | 9 |
| Parth | Sentiment analysis algorithm, lexicon, scoring, negation and unit tests | `feature/parth` | 9 |
| Prithviraj | React dashboard, frontend/API integration, speech recognition and microphone UI | `feature/prithviraj` | 9 |

Akshit owns backend infrastructure and calls Parth's sentiment module; he does not implement sentiment scoring, React UI, or browser speech recognition. Parth owns the lexicon, matching, scoring, negation, matched-word extraction and focused unit tests; he does not own Express routes, database operations, dashboard UI, or speech recognition. Prithviraj owns the React + Vite dashboard, transcript workflow, REST API consumption, Web Speech API, microphone permissions/status, manual fallback, and frontend loading/validation/error states; he does not create duplicate API routes or a second sentiment algorithm.

The team agrees on the sentiment module's JavaScript interface before integration, including input format and output fields (`sentiment`, `score`, and `matched_terms`). Akshit and Prithviraj agree on endpoint request/response formats before frontend integration. File ownership is primary responsibility: report bugs across boundaries, then have the primary owner implement fixes unless the team explicitly agrees otherwise. Coordinate edits to shared configuration, API contracts, README, and integration files to avoid conflicts.

**GitHub repository:** <https://github.com/aks662/Sentiment-Analyzer>

**IDE instruction file:** `thoughts.md`  
**Task allocation and commit plan:** `task.md`  
**Copy/paste implementation prompt:** `IDE_PROMPT.md`  
**Private viva notes:** `private-notes/` (must not be committed)

## 11. Git workflow and commit-history rules

Each member is responsible for **9 genuine, meaningful commits** on their own branch. The plan in `task.md` describes reviewable work increments, not permission to create empty commits or split trivial work artificially. Each commit must reflect work performed by its author.

Recommended flow:

1. Create `main` and an `integration` branch from the initial project scaffold.
2. Each member creates and pushes their own branch from `integration`: `feature/akshit-rana`, `feature/parth`, or `feature/prithviraj`.
3. Members primarily modify files in their ownership area; coordinate shared files and interface changes. Each student authors their own commits.
4. Follow the integration sequence: Parth exposes the sentiment module; Akshit integrates it into Express and verifies persistence; Prithviraj connects the dashboard and speech workflow to the API. Each owner verifies their component.
5. Open pull requests from all three feature branches into `integration`; review and test the combined app there.
6. Open one final pull request from `integration` into `main` after the team agrees the project is ready.
7. To preserve all individual commits, do **not** squash the feature-branch pull requests. Use a merge method that retains their commits (for example, Create a merge commit).

A single IDE can help create branches, inspect diffs, and merge pull requests. However, it cannot truthfully make all three students' contributions. Each student should use their own GitHub account and verified commit email for their own work. Do not fake authorship, backdate commits, or manufacture empty commits. The teacher can inspect the actual code changes and GitHub attribution.

Useful verification command:

```bash
git log --all --format="%h | %an <%ae> | %s" --graph
```

## 12. Submission acceptance checklist

- [ ] The app opens in a browser and looks like a graphical dashboard, not a terminal application.
- [ ] Manual transcript entry works even when microphone recognition is unavailable.
- [ ] The microphone demo can start, transcribe speech where supported, and stop cleanly.
- [ ] Positive, neutral, and negative example transcripts produce sensible baseline labels.
- [ ] Analysed results are saved in PostgreSQL and reappear after refresh.
- [ ] Summary counts agree with the stored records.
- [ ] Empty transcripts, database errors, and microphone errors are handled visibly.
- [ ] No secrets or private viva notes are committed.
- [ ] Each team member has 9 or more genuine commits under their own GitHub attribution.
- [ ] The team can explain the limitations of lexicon sentiment and browser speech recognition.
