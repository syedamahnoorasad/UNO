# UNO Multiplayer Game

Real-time UNO experience for four players, built with a TypeScript backend and a modern React client. Players receive live updates for turns, card plays, and chat-style system messages.

## Tech Stack
- **Backend:** Node.js, Express, Socket.IO, TypeScript, ts-node
- **Frontend:** React, TypeScript, React Router, Socket.IO Client (Create React App)
- **Styling:** Custom CSS with themed UNO table and animated message log

## Prerequisites
- Node.js 18+ (includes `npm`)
- Recommended: a separate terminal tab/window for the backend and frontend

## Install Dependencies

```bash
# from the project root
npm install

# install frontend dependencies
cd frontend
npm install
```

## Running the App

Start the backend (from the project root):

```bash
npx ts-node -P tsconfig.server.json backend/server.ts
```

Start the frontend (in a second terminal, from the `frontend` folder):

```bash
npm start
```

By default, the backend listens on `http://localhost:3001` and the frontend on `http://localhost:3000`.

## Gameplay Highlights
- Join a shared lobby and launch a synchronized game session once four players connect.
- Player seating is assigned by join order, with clearly labeled positions around the table.
- Live messaging sidebar announces turns (`Alex's turn!`), color picks, wins, and other events.
- Wild card selection overlay and UNO victory banner for dramatic finishes.

## Screenshots

![Game Table](images/Screenshot%202025-10-30%20at%204.54.04%E2%80%AFPM.png)

![Gameplay Messaging](images/Screenshot%202025-10-30%20at%205.39.10%E2%80%AFPM.png)
