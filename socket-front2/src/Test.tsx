import { useParams } from "react-router-dom";
import { socket } from "./utils/socket";
import { useEffect, useRef } from "react";

export default function Test() {
  const roomID = 1;
  const userId = 8;
  useEffect(() => {
    socket.emit("enter", { roomID, userId });
    socket.on("msgList", (data: any) => {
      console.log("msgList : ", data);
    });
    socket.on("error", (data: any) => {
      console.log(data);
      alert(data.msg);
      window.location.href = "/";
    });
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const sendMsg = () => {
    if (inputRef.current == null) return;

    const newMessage = {
      msg: inputRef.current.value,
      userId,
    };
    socket.emit("sendMSG", newMessage);

    socket.on("sendMSG", (data) => {
      console.log("data : ", data);
    });
  };
  return (
    <>
      Test 중입니다.
      <br />
      <input type="text" ref={inputRef} />
      <button onClick={sendMsg}>전송</button>
    </>
  );
}
