import { Socket } from "socket.io-client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import "./uno.css";
import "./uno-cards.css";
import UnoCard from "./CardContainer";
import { useNavigate } from "react-router-dom";

interface CardData {
  color: string | null;
  value: string;
}

interface PlayerSeatInfo {
  name: string;
  seat: number;
}

type YourNamePayload = string | string[] | { name?: string; seat?: number; roster?: PlayerSeatInfo[] };

interface GameEventsProps {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
}

function Game({ socket }: GameEventsProps) {
  const [hand, setHand] = useState<CardData[]>([]);
  const [discard, setDiscard] = useState<CardData | null>(null);

  const [playerInfo, setPlayerInfo] = useState<PlayerSeatInfo | null>(null);
  const [playerOrder, setPlayerOrder] = useState<PlayerSeatInfo[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [wildSelection, setWildSelection] = useState<number | null>(null);
  const [unoWinner, setUnoWinner] = useState<string | null>(null);
  const [colorMessage, setColorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const appendMessage = useCallback((text: string) => {
    const clean = (text ?? "").trim();
    if (!clean) {
      return;
    }

    setMessages((previous) => [...previous, clean]);
  }, []);

  // --- socket listeners
  useEffect(() => {
    const handleTurn = (msg: string) => {
      console.log(msg);
      appendMessage(msg);
    };

    const handleCardUnplayable = (msg: string) => {
      console.log(msg);
      appendMessage(msg);
    };

    const handleWinner = (msg: string) => {
      console.log(msg);
      appendMessage(msg);
      setWildSelection(null);
      navigate("/finish", { state: { winner: msg } });
    };

    const handleFirstPerson = (msg: string) => {
      console.log(msg);
      appendMessage(msg);
    };

    const handleHand = (handData: CardData[]) => {
      console.log("I received the hand", handData);
      setHand(handData);
    };

    const handleDiscardPile = (card: CardData) => {
      console.log("Display discard pile", card);
      setDiscard(card);
    };

    const normalizeRoster = (roster?: PlayerSeatInfo[]) => {
      if (!Array.isArray(roster)) {
        return;
      }

      const sanitized = roster
        .filter(
          (entry): entry is PlayerSeatInfo =>
            !!entry && typeof entry.name === "string" && typeof entry.seat === "number"
        )
        .sort((a, b) => a.seat - b.seat);

      setPlayerOrder(sanitized);
    };

    const handleYourName = (payload: YourNamePayload) => {
      console.log("Display your name", payload);

      if (Array.isArray(payload)) {
        const [first] = payload;
        if (typeof first === "string") {
          setPlayerInfo((prev) => ({
            name: first,
            seat: prev?.seat ?? 1,
          }));
        }
        return;
      }

      if (typeof payload === "string") {
        setPlayerInfo((prev) => ({
          name: payload,
          seat: prev?.seat ?? 1,
        }));
        return;
      }

      if (payload && typeof payload === "object") {
        const { name: playerName, seat, roster } = payload;
        if (playerName) {
          setPlayerInfo({
            name: playerName,
            seat: typeof seat === "number" ? seat : 1,
          });
        }
        normalizeRoster(roster);
      }
    };

    const handlePlayerOrder = (order: PlayerSeatInfo[]) => {
      console.log("Display player order", order);
      normalizeRoster(order);
    };

    const handleColorPicked = (payload: { player?: string; color?: string }) => {
      if (!payload?.color) {
        return;
      }
      const colorName = payload.color.charAt(0).toUpperCase() + payload.color.slice(1);
      const announcer = payload.player ? `${payload.player} chose` : "Color chosen";
      const announcement = `${announcer} ${colorName}`;
      setColorMessage(announcement);
      appendMessage(announcement);
    };

    const handleUno = (payload: { winner: string }) => {
      const winnerName = payload?.winner ?? "A player";
      setUnoWinner(winnerName);
      const announcement = `UNO! ${winnerName} wins!`;
      appendMessage(announcement);
    };

    socket.on("turn", handleTurn);
    socket.on("card-unplayable", handleCardUnplayable);
    socket.on("winner", handleWinner);
    socket.on("first-person", handleFirstPerson);
    socket.on("hand", handleHand);
    socket.on("discardPile", handleDiscardPile);
    socket.on("yourName", handleYourName);
    socket.on("player-order", handlePlayerOrder);
    socket.on("color-picked", handleColorPicked);
    socket.on("uno", handleUno);

    // ✅ cleanup all listeners on unmount
    return () => {
      socket.off("turn", handleTurn);
      socket.off("card-unplayable", handleCardUnplayable);
      socket.off("winner", handleWinner);
      socket.off("first-person", handleFirstPerson);
      socket.off("hand", handleHand);
      socket.off("discardPile", handleDiscardPile);
      socket.off("yourName", handleYourName);
      socket.off("player-order", handlePlayerOrder);
      socket.off("color-picked", handleColorPicked);
      socket.off("uno", handleUno);
    };
  }, [socket, navigate, appendMessage]);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, [messages]);

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

  const rosterBySeat = useMemo(() => {
    const map = new Map<number, PlayerSeatInfo>();

    playerOrder.forEach((entry) => {
      if (entry && typeof entry.seat === "number" && entry.name) {
        map.set(entry.seat, entry);
      }
    });

    if (playerInfo?.name && typeof playerInfo.seat === "number") {
      map.set(playerInfo.seat, {
        name: playerInfo.name,
        seat: playerInfo.seat,
      });
    }

    return map;
  }, [playerOrder, playerInfo]);

  const seatClasses = ["player-one", "player-two", "player-three", "player-four"];
  const welcomeHeading = playerInfo?.name ? `Welcome to UNO, ${playerInfo.name}!` : "Welcome to UNO!";

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
              {seatClasses.map((positionClass, index) => {
                const seat = index + 1;
                const occupant = rosterBySeat.get(seat);
                const displayName = occupant?.name || `Waiting for Player ${seat}`;
                const isYou =
                  occupant?.name && playerInfo?.name
                    ? occupant.name === playerInfo.name
                    : false;
                const classes = ["player-tag", positionClass];

                if (isYou) {
                  classes.push("player-tag-self");
                }

                return (
                  <div className="game-players-container" key={positionClass}>
                    <div className={classes.join(" ")}>
                      <span className="player-label">{`Player ${seat}`}</span>
                      <span className="player-name">{displayName}</span>
                    </div>
                  </div>
                );
              })}
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
            <div className="messages-header">
              <h1>Messages</h1>
              <p className="messages-welcome">{welcomeHeading}</p>
            </div>
            {colorMessage && <div className="message-banner">{colorMessage}</div>}
            <div className="message-box" ref={messageListRef}>
              {messages.length === 0 ? (
                <div className="message-placeholder">
                  Messages will appear here as the game progresses.
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={`${index}-${msg}`} className="message-content-container">
                    {msg}
                  </div>
                ))
              )}
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
