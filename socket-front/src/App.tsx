import { useCallback } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000/chat");

const App = () => {
  const connectSocket = useCallback(() => {
    socket.connect();
  }, []);
  const sendChat = () => {
    const msg = "sendChat";
    socket.emit("msgToServer", { msg });
  };
  return (
    <>
      <h1>WebSocket Chat</h1>
      <button
        onClick={() => {
          connectSocket();
        }}
      >
        connect
      </button>
      <button onClick={sendChat}>sendChat</button>
    </>
  );
};

export default App;
