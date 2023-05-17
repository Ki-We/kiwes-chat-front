import { useParams } from "react-router-dom";
import { socket } from "./utils/socket";
import { useEffect, useRef, useState } from "react";
import { Message } from "./utils/interface";

export default function Chat() {
  const { id } = useParams();
  const [message, setMessage] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.emit("enterRoom", { id });

    socket.on("msgList", (data) => {
      setMessage(data);
    });
  }, []);
  useEffect(() => {
    socket.on("sendMsg", (data: Message) => {
      const newList = [...message, data];
      setMessage(newList);
    });
  }, [message]);

  const sendMsg = () => {
    if (inputRef.current == null) return;
    socket.emit("sendMsg", { msg: inputRef.current.value });

    socket.on("sendMsg", (data: Message) => {
      const newList = [...message, data];
      setMessage(newList);
    });
  };
  return (
    <>
      <table border={1}>
        <tr>
          <th>작성자</th>
          <th>내용</th>
          <th>시간</th>
        </tr>
        {message.map((m) => (
          <tr>
            <td>{m.writer}</td>
            <td>{m.msg}</td>
            <td>{m.time}</td>
          </tr>
        ))}
      </table>
      <hr />

      <input type="text" ref={inputRef} />
      <button onClick={sendMsg}>전송</button>
    </>
  );
}
