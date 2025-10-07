import { Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import "./uno.css";
import "./uno-cards.css";
import UnoCard from "./CardContainer";
import { useNavigate } from "react-router-dom";

interface CardData {
  color: string | null;
  value: string;
}

interface GameEventsProps {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
}

function Game({ socket }: GameEventsProps) {
  const [hand, setHand] = useState<CardData[]>([]);
  const [discard, setDiscard] = useState<CardData | null>(null);
  const [deck, setDeck] = useState<CardData | null>(null);

  const [name, setName] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [message, setMessage] = useState("Lets Start with Player 1");
  const [username, setUsername] = useState("Welcome to Uno");
  const [wildSelection, setWildSelection] = useState<number | null>(null);
  const [unoWinner, setUnoWinner] = useState<string | null>(null);
  const [colorMessage, setColorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // --- socket listeners
  useEffect(() => {
    socket.on("turn", (msg: string) => {
      console.log(msg);
      setMessage(msg);
    });

    socket.on("card-unplayable", (msg: string) => {
      console.log(msg);
      setMessage(msg);
    });

    socket.on("winner", (msg: string) => {
      console.log(msg);
      setMessage(msg);
      setWildSelection(null);
      navigate("/finish", { state: { winner: msg } });
    });

    socket.on("first-person", (msg: string) => {
      console.log(msg);
      setMessage(msg);
    });

    socket.on("username", (msg: string) => {
      const welcome = "Welcome " + msg;
      setUsername(welcome);
    });

    socket.on("hand", (handData: CardData[]) => {
      console.log("I received the hand", handData);
      setHand(handData);
    });

    socket.on("discardPile", (card: CardData) => {
      console.log("Display discard pile", card);
      setDiscard(card);
    });

    socket.on("deckTop", (card: CardData) => {
      console.log("Deck top", card);
      setDeck(card);
    });

    socket.on("yourName", (playerName: string) => {
      console.log("Display your name");
      setName(playerName);
    });

    socket.on("otherPlayerNames", (others: string[]) => {
      console.log("Display other player names", others);
      setPlayers(others);
    });

    socket.on("color-picked", (payload: { player?: string; color?: string }) => {
      if (!payload?.color) {
        return;
      }
      const colorName = payload.color.charAt(0).toUpperCase() + payload.color.slice(1);
      const announcer = payload.player ? `${payload.player} chose` : "Color chosen";
      const announcement = `${announcer} ${colorName}`;
      setColorMessage(announcement);
      setMessage(announcement);
    });

    socket.on("uno", (payload: { winner: string }) => {
      const winnerName = payload?.winner ?? "A player";
      setUnoWinner(winnerName);
      setMessage(`UNO! ${winnerName} wins!`);
    });

    // ✅ cleanup all listeners on unmount
    return () => {
      socket.off("turn");
      socket.off("card-unplayable");
      socket.off("winner");
      socket.off("first-person");
      socket.off("username");
      socket.off("hand");
      socket.off("discardPile");
      socket.off("deckTop");
      socket.off("yourName");
      socket.off("otherPlayerNames");
      socket.off("color-picked");
      socket.off("uno");
    };
  }, [socket, navigate]);

  useEffect(() => {
    if (!unoWinner) return;

    const timer = setTimeout(() => setUnoWinner(null), 4000);
    return () => clearTimeout(timer);
  }, [unoWinner]);

  useEffect(() => {
    if (!colorMessage) return;

    const timer = setTimeout(() => setColorMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [colorMessage]);

  // --- button actions
  const handlePass = () => {
    socket.emit("pass", "");
  };

  const handleCardClick = (index: number) => {
    if (index < 0 || index >= hand.length) {
      return;
    }

    const selectedCard = hand[index];
    if (!selectedCard) {
      return;
    }

    if (selectedCard.value === "WILD" || selectedCard.value === "D4") {
      setWildSelection(index);
      return;
    }

    socket.emit("play-card", [index, selectedCard.color]);
  };

  const handleWildColorSelect = (color: string) => {
    if (wildSelection === null) {
      return;
    }

    socket.emit("play-card", [wildSelection, color]);
    setWildSelection(null);
  };

  const cancelWildSelection = () => {
    setWildSelection(null);
  };

  return (
    <div className="GamePage">
      {unoWinner && (
        <div className="uno-overlay">
          <div className="uno-banner">UNO! {unoWinner} wins!</div>
        </div>
      )}
      {wildSelection !== null && (
        <div className="wild-picker-overlay">
          <div className="wild-picker">
            <h2>Choose a color</h2>
            <div className="wild-picker-buttons">
              {[
                { label: "Red", value: "red" },
                { label: "Blue", value: "blue" },
                { label: "Green", value: "green" },
                { label: "Yellow", value: "yellow" },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`wild-choice ${option.value}`}
                  onClick={() => handleWildColorSelect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button className="wild-choice cancel" onClick={cancelWildSelection}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="main-container">
        <div className="game-container">
          <div className="heading-container">
            <h1>UNO</h1>
          </div>
          <div className="game-table-container">
            <div className="game-table">
              <div className="card-area">
                {/* Discard pile */}
                {discard && (
                  <UnoCard
                    index={-1} // not clickable
                    color={discard.color}
                    value={discard.value}
                  />
                )}

                {/* Deck pile (face-down) */}
                <div className="card back">UNO</div>
              </div>
              <div className="game-players-container">
                <div className="player-tag player-one">{name}</div>
              </div>
              <div className="game-players-container">
                <div className="player-tag player-two">{players[0]}</div>
              </div>
              <div className="game-players-container">
                <div className="player-tag player-three">{players[1]}</div>
              </div>
              <div className="game-players-container">
                <div className="player-tag player-four">{players[2]}</div>
              </div>
            </div>
          </div>
          <div className="select-rang-container">
            <button
              className="button-select-rang"
              onClick={handlePass}
              disabled={wildSelection !== null}
            >
              Pass
            </button>
          </div>
        </div>
        <div className="messages-and-cards-container">
          <div className="right-side-container messages-container">
            <h1>Messages</h1>
            <div className="message-box">
              <div className="message-content-container">{message}</div>
              {colorMessage && (
                <div className="message-content-container">{colorMessage}</div>
              )}
              <div className="message-content-container">{username}</div>
            </div>
          </div>
          <div className="right-side-container my-cards-container">
            <h1>My Cards</h1>
            <div className="my-cards-inner-container">
              {hand.map((card, index) => (
                <UnoCard
                  key={index}
                  index={index}
                  color={card.color}
                  value={card.value}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
