// server.ts

import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

import home, { resetLobbyState } from "./HomePage";
import { game_start, playCard, checkForUno, pass, resetGameSession } from "./GameEvents";

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // frontend
    methods: ["GET", "POST"],
  },
});

// -------------------------
// Player + GameSession Types
// -------------------------
class Player {
  socket!: Socket;
  name: string = "";
  hand: any[] = [];

  constructor(socket: Socket, name: string, hand: any[]) {
    this.socket = socket;
    this.name = name;
    this.hand = hand;
  }
}

class GameSession {
  deck: any[] = [];
  discardPile: any[] = [];
  currentPlayer: number = 0;
  direction: number = 1;
  players: Player[] = [];
  chosencolor: string = "";
  winner: string = "";
  gameOver: boolean = false;

  constructor(players: Player[]) {
    this.players = players;
  }
}

// -------------------------
// Initialize Players + Game
// -------------------------
const players: Player[] = [
  new Player({} as Socket, "", []),
  new Player({} as Socket, "", []),
  new Player({} as Socket, "", []),
  new Player({} as Socket, "", []),
];

const GameSession1 = new GameSession(players);

const sockets: Socket[] = [];
const socket_id: string[] = [];

// -------------------------
// Socket.IO Logic
// -------------------------
io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  // existing lobby logic
  home(socket, io, sockets, socket_id, players);
  game_start(socket, io, players, GameSession1, sockets);

  // -------------------------
  // PLAY CARD
  // -------------------------
  socket.on("play-card", (card: any) => {
    const [cardIndex, chosenColor] = card;

    // Find player
    const playerIndex = players.findIndex((p) => p.socket.id === socket.id);
    if (playerIndex === -1) return;

    if (GameSession1.gameOver) {
      io.to(socket.id).emit("turn", `${GameSession1.winner} already won the game`);
      return;
    }

    if (playerIndex !== GameSession1.currentPlayer) {
      const currentName = GameSession1.players[GameSession1.currentPlayer]?.name || "another player";
      io.to(socket.id).emit("turn", `It's ${currentName}'s turn`);
      return;
    }

    // Attempt to play the card
    const flag: boolean = playCard(io, players, cardIndex, GameSession1, chosenColor);

    if (!flag) {
      io.to(socket.id).emit("card-unplayable", "Card is unplayable");
      return;
    }

    if (GameSession1.gameOver) {
      return;
    }
  });

  // -------------------------
  // PASS (Draw a card)
  // -------------------------
//   socket.on("pass", () => {
//     const idx = GameSession1.currentPlayer;
//     const currentPlayer = GameSession1.players[idx];

//     // Draw one card from deck
//     const drawn = GameSession1.deck.pop();
//     if (drawn) currentPlayer.hand.push(drawn);

//     // ✅ Send updated hand only to this player
//     io.to(currentPlayer.socket.id).emit("hand", currentPlayer.hand);

//     // ✅ Advance turn
//     GameSession1.currentPlayer =
//       (idx + GameSession1.direction + GameSession1.players.length) % GameSession1.players.length;

//     io.emit("turn", `It's ${GameSession1.players[GameSession1.currentPlayer].name}'s turn`);
//   });
// });

  socket.on("pass", () => {
    const playerIndex = players.findIndex((p) => p.socket.id === socket.id);
    if (playerIndex === -1) return;

    if (GameSession1.gameOver) {
      io.to(socket.id).emit("turn", `${GameSession1.winner} already won the game`);
      return;
    }

    if (playerIndex !== GameSession1.currentPlayer) {
      const currentName = GameSession1.players[GameSession1.currentPlayer]?.name || "another player";
      io.to(socket.id).emit("turn", `It's ${currentName}'s turn`);
      return;
    }

    pass(io, GameSession1, players);
  });

  socket.on("restart-game", () => {
    resetGameSession(GameSession1, players);
    sockets.length = 0;
    socket_id.length = 0;
    resetLobbyState();
    io.emit("game-reset");
  });

});

// -------------------------
// Start Server
// -------------------------
const PORT = 3001; // ✅ must not clash with frontend
httpServer.listen(PORT, () => {
  console.log(`SERVER IS LISTENING ON PORT ${PORT}`);
});



   
