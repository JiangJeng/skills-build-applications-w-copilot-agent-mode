# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep the React app thin and route-driven, with a shared API client and reusable capability cards that render loading, empty, success, and error states with accessible text.
- Logic tier decision: Put route handlers in `src/routes/api.ts` and behavior in `src/services/octofitService.ts`; keep validation in Mongoose schemas and business logic in services so API responses stay explicit and consistent.
- Data tier decision: Use MongoDB via a shared connection helper and Mongoose models that enforce required fields and IDs, while seed logic upserts stable demo records without deleting unrelated user data.
- Activity tracking approach: Accept `userId`/`teamId` plus `type` and `minutes`, validate the references, and create a record with computed `points` and `occurredAt` on success.
- Team management approach: Require a non-empty `name` and `mascot`, preserve `members` as ObjectIds, and expose team membership in list responses.
- Leaderboard approach: Aggregate activity totals per team, sort by highest score first, and assign a 1-based rank while returning `teamName`, `totalPoints`, and `rank`.
- Workout suggestions approach: Match by user email, prefer workouts whose `focus` matches the user's `fitnessGoal` or recent activity type, and include a clear `reason` string for the top recommendation.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — verifies required Mongoose validation and idempotent seeding; failures point to schema/defaulting gaps in the data layer.
- API command: `npm run test:api --prefix octofit-tracker/backend` — verifies endpoint behavior for invalid input, leaderboard ordering, and workout suggestions; failures point to route/service contract issues.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — verifies loading, empty, success, and accessible error states for each screen; failures point to missing UI behavior rather than backend logic.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — catches TypeScript or runtime contract issues in the server implementation.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — catches TypeScript and Vite bundle issues in the presentation tier.
- Validation result: The final pass was obtained by running the backend data test, backend API test, and frontend test commands above; all three suites passed successfully.
