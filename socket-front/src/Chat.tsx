import { useParams } from "react-router-dom";
import { socket } from "./utils/socket";
import { useEffect, useRef, useState } from "react";
import { Message } from "./utils/interface";
import { useSelector } from "react-redux";
import "./styles/Chat.css";

export default function Chat() {
  const { id } = useParams();
  const [message, setMessage] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const nickname = useSelector((state: any) => state.user);

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
    listRef.current?.scrollIntoView({ behavior: "smooth" });
    listRef.current?.scrollTo(0, listRef.current?.scrollHeight);
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
      <div className="chat-list" ref={listRef}>
        {message.map((m: { writer: string; msg: string; time: string }) => {
          let className = "other-chat";
          if (m.writer == nickname) className = "my-chat";
          else if (m.writer == "system") className = "system";

          return (
            <div key={`${m.msg}_${m.writer}`} className={className}>
              <p>{m.writer}</p>
              <div>
                <span style={{ marginRight: "10px" }}>{m.msg}</span>
                <span style={{ fontSize: "0.6em" }}>{m.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      <hr />

      <input type="text" ref={inputRef} />
      <button onClick={sendMsg}>전송</button>
    </>
  );
}
