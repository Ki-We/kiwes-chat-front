import { socket } from "./utils/socket";
import { useEffect } from "react";

export default function Test() {
  const roomID = 1;
  const userID = 1;
  useEffect(() => {
    socket.on("msgList", (data: any) => {
      console.log("msgList : ", data);
    });
    socket.on("error", (data: any) => {
      console.log(data);
      alert(data.msg);
      window.location.href = "/";
    });
  }, []);
  const enterRoom = () => {
    socket.emit("enter", { roomID, userID });
  };
  const permitRoom = () => {
    socket.emit("permit", { roomID, user: "테스트 사용자" });
  };
  return (
    <>
      Test 중입니다.
      <br />
      <button onClick={enterRoom}>enter</button>
      <button onClick={permitRoom}>permit</button>
    </>
  );
}
