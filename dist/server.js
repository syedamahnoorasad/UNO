"use strict";
// server.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const HomePage_1 = __importStar(require("./HomePage"));
const GameEvents_1 = require("./GameEvents");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:3000", // frontend
        methods: ["GET", "POST"],
    },
});
// -------------------------
// Player + GameSession Types
// -------------------------
class Player {
    constructor(socket, name, hand) {
        this.name = "";
        this.hand = [];
        this.socket = socket;
        this.name = name;
        this.hand = hand;
    }
}
class GameSession {
    constructor(players) {
        this.deck = [];
        this.discardPile = [];
        this.currentPlayer = 0;
        this.direction = 1;
        this.players = [];
        this.chosencolor = "";
        this.winner = "";
        this.gameOver = false;
        this.players = players;
    }
}
// -------------------------
// Initialize Players + Game
// -------------------------
const players = [
    new Player({}, "", []),
    new Player({}, "", []),
    new Player({}, "", []),
    new Player({}, "", []),
];
const GameSession1 = new GameSession(players);
const sockets = [];
const socket_id = [];
// -------------------------
// Socket.IO Logic
// -------------------------
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // existing lobby logic
    (0, HomePage_1.default)(socket, io, sockets, socket_id, players);
    (0, GameEvents_1.game_start)(socket, io, players, GameSession1, sockets);
    // -------------------------
    // PLAY CARD
    // -------------------------
    socket.on("play-card", (card) => {
        const [cardIndex, chosenColor] = card;
        // Find player
        const playerIndex = players.findIndex((p) => p.socket.id === socket.id);
        if (playerIndex === -1)
            return;
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
        const flag = (0, GameEvents_1.playCard)(io, players, cardIndex, GameSession1, chosenColor);
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
        if (playerIndex === -1)
            return;
        if (GameSession1.gameOver) {
            io.to(socket.id).emit("turn", `${GameSession1.winner} already won the game`);
            return;
        }
        if (playerIndex !== GameSession1.currentPlayer) {
            const currentName = GameSession1.players[GameSession1.currentPlayer]?.name || "another player";
            io.to(socket.id).emit("turn", `It's ${currentName}'s turn`);
            return;
        }
        (0, GameEvents_1.pass)(io, GameSession1, players);
    });
    socket.on("restart-game", () => {
        (0, GameEvents_1.resetGameSession)(GameSession1, players);
        sockets.length = 0;
        socket_id.length = 0;
        (0, HomePage_1.resetLobbyState)();
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
