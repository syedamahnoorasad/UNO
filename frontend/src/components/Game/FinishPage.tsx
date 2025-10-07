import { Socket } from "socket.io-client";
import React, { useEffect, useMemo, useState } from "react";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { useLocation, useNavigate } from "react-router-dom";
import "./FinishPage.css";

interface FinishGameScreenProps {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
}

type FinishLocationState = {
  winner?: string;
} | null;

function FinishGameScreen({ socket }: FinishGameScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMessage = useMemo(() => {
    const state = location.state as FinishLocationState;
    return state?.winner ?? "Waiting for the final result...";
  }, [location.state]);

  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    const state = location.state as FinishLocationState;
    if (state?.winner) {
      setMessage(state.winner);
    }
  }, [location.state]);

  useEffect(() => {
    const handleWinner = (text: string) => {
      setMessage(text);
    };

    const handleReset = () => {
      setMessage("Waiting for the final result...");
      navigate("/", { replace: true });
    };

    socket.on("winner", handleWinner);
    socket.on("game-reset", handleReset);

    return () => {
      socket.off("winner", handleWinner);
      socket.off("game-reset", handleReset);
    };
  }, [socket, navigate]);

  const handleRestart = () => {
    socket.emit("restart-game");
    navigate("/", { replace: true });
  };

  return (
    <div className="finish-page">
      <div className="finish-card">
        <h1 className="finish-title">Game Over</h1>
        <p className="finish-subtitle">{message}</p>
        <button className="finish-button" onClick={handleRestart}>
          Start Another Game
        </button>
      </div>
    </div>
  );
}

export default FinishGameScreen;
