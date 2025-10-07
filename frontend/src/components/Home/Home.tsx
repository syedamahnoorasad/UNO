import { Socket } from "socket.io-client" 
import React, { useEffect } from 'react';
import { useState } from 'react';
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import './Home.css'
import { Navigate, useNavigate } from "react-router-dom";

//create an interface for the props that you want to pass to this component
interface HomePageProps {
    socket: Socket<DefaultEventsMap, DefaultEventsMap> 
}


function HomePage({ socket }: HomePageProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [join, joined] = useState(true);
  const [username, setUsername] = useState("");
  const [isInputFilled, setIsInputFilled] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [usernameList, usernameListSet] = useState("");
  const navigate = useNavigate();
  const handleClick = (socket: Socket) => {
    console.log("Socket ID:", socket.id);
    const cleaned = username.trim();
    if (!cleaned) {
      return;
    }

    joined(false);
    socket.emit("username", cleaned);
    setUsername(cleaned);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    setIsInputFilled(event.target.value.trim() !== "");
  };

  useEffect(() => {
    console.log("Mounting the Home.tsx component...");

    socket.on("player-joined", (count: number) => {
      console.log("Player", count, "Joined");
      setPlayerCount(count);
    });

    socket.on("start-game", () => {
      console.log("Starting the game...");
      setGameStarted(true);
      joined(false);
      socket.emit("signal-to-begin", "");
    });

    socket.on("redirect-all", () => {
      console.log("redirecting all players to game page");
      navigate("/game");
    });

    socket.on("username-joined", (usernames: string[]) => {
      console.log(usernames, "have joined");
      usernameListSet(usernames.join(", "));
    });

    return () => {
      socket.off("player-joined");
      socket.off("start-game");
      socket.off("redirect-all");
      socket.off("username-joined");
    };
  }, [socket, navigate]);

    // useEffect(() => {
    //   socket.on('username-joined', (username:string[]) => {
    //       console.log(username, 'have joined');
    //       const string = JSON.stringify(username);
    //       usernameListSet(string);
    //   });
    // }, [socket]);

    // socket.on('private-message', (message:string) => {
    //   console.log('Received a private message:', message);
    // });

    // useEffect(() => {
    //     socket.on('start-game', () => {
    //         // console.log('Player 4 Joined');            
    //         console.log('Starting the game... ddfdsf');
    //         setGameStarted(true);
    //         joined(false);            
    //         socket.emit('signal-to-begin','')
    //         return () => socket.off('start-game');

    //     });
    // }, [socket]);

  //   useEffect(() => {
  //     socket.on('redirect-all', () => {
  //         navigate('/game')
  //     });
  // }, [socket]);

  return (
    <div className="home-page">
      <div className="home-card">
        <div className="home-logo">UNO</div>
        <h2 className="home-title">Jump into a match</h2>
        <p className="home-subtitle">Bring three friends and get ready to shout UNO!</p>

        {gameStarted ? (
          <div className="home-status">
            <p className="home-status-primary">Let the game begin!</p>
            <p className="home-status-secondary">
              {playerCount} player(s) joined — {usernameList || "waiting for lobby"}
            </p>
          </div>
        ) : join ? (
          <form
            className="home-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleClick(socket);
            }}
          >
            <label htmlFor="username" className="home-label">
              Enter your name to join the lobby
            </label>
            <input
              id="username"
              className="home-input"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
            />
            <button type="submit" className="home-button" disabled={!isInputFilled}>
              Enter Lobby
            </button>
          </form>
        ) : (
          <div className="home-status">
            <p className="home-status-primary">Waiting for more players...</p>
            <p className="home-status-secondary">
              {playerCount} player(s) joined — {usernameList || "lobby is filling up"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


export default HomePage
