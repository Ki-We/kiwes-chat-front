import { useParams } from "react-router-dom";
import { socket } from "./utils/socket";
import { useEffect, useRef, useState } from "react";
import { Message, Notice } from "./utils/interface";
import { useSelector } from "react-redux";
import "./styles/Chat.css";

export default function Chat() {
  const { id } = useParams();
  const [message, setMessage] = useState<Message[]>([]);
  const [notice, setNotice] = useState<Notice>();
  const [isNotice, setIsNotice] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const nickname = useSelector((state: any) => state.user);

  useEffect(() => {
    socket.emit("enterRoom", { id });

    socket.on("msgList", (data: any) => {
      console.log(data);
      setMessage(data);
    });
    socket.on("error", (data: any) => {
      console.log(data);
      alert(data.msg);
      window.location.href = "/";
    });
  }, []);
  useEffect(() => {
    console.log(message);
    socket.on("notice", (data: Notice) => setNotice(data));
    socket.on("sendMsg", (data: Message) => setMessage([...message, data]));
    console.log(message);
    listRef.current?.scrollIntoView({ behavior: "smooth" });
    listRef.current?.scrollTo(0, listRef.current?.scrollHeight);
  }, [message]);

  const sendMsg = () => {
    if (inputRef.current == null) return;

    socket.emit("sendMsg", { msg: inputRef.current.value });
    if (isNotice) socket.emit("notice", { notice: inputRef.current.value });
  };
  return (
    <>
      {notice && (
        <div className="notice">
          <strong>공지</strong> : {notice.notice} by.{notice.writer}{" "}
          {notice.time}
        </div>
      )}
      <div className="chat-list" ref={listRef}>
        {message.map(
          (m: { writer: string; msg: string; time: string }, idx: number) => {
            let className = "other-chat";
            if (m.writer == nickname) className = "my-chat";
            else if (m.writer == "system") className = "system";

            return (
              <div key={`msg_${idx}`} className={className}>
                <p>{m.writer}</p>
                <div>
                  <span style={{ marginRight: "10px" }}>{m.msg}</span>
                  <span style={{ fontSize: "0.6em" }}>{m.time}</span>
                </div>
              </div>
            );
          }
        )}
      </div>

      <hr />
      <input
        type="checkbox"
        checked={isNotice}
        onChange={(e) => setIsNotice(!isNotice)}
      />
      <input type="text" ref={inputRef} />
      <button onClick={sendMsg}>전송</button>
    </>
  );
}
