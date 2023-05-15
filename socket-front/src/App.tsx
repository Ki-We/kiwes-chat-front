import { socket } from "./utils/socket";

const App = () => {
  const sendChat = () => {
    const msg = "sendChat";
    socket.emit("sendMSG", { msg });
  };
  return (
    <>
      <h1>WebSocket Chat</h1>
      <button onClick={sendChat}>asdfasdfsadf</button>
    </>
  );
};

export default App;
