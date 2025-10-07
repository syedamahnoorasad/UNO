import React from 'react';
import logo from './logo.svg';
import HomePage from './components/Home/Home';
import GamePage from './components/Game/GamePage';
import FinishPage from './components/Game/FinishPage';


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import {io} from "socket.io-client"
const socket = io('http://localhost:3001',{ transports: ["websocket"] });
socket.connect()


function App() {
  
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage socket={socket} />} />
          <Route path="/game" element={<GamePage socket={socket} />} />
          <Route path="/finish" element={<FinishPage socket={socket} />} />

        </Routes>
      </Router>

    </div>
  );
}

export default App;
