import { useParams } from "react-router-dom";
import { socket } from "./utils/socket";
import { useEffect, useRef, useState } from "react";
import { Message, Notice } from "./utils/interface";
import "./styles/Chat.css";
import { logout } from "./utils/common";

export default function Chat() {
  const { id } = useParams();
  const [nickname, setNickname] = useState<string>("");
  const [isMaster, setIsMaster] = useState<boolean>(false);
  const [message, setMessage] = useState<Message[]>([]);
  const [notice, setNotice] = useState<Notice>();
  const [master, setMaster] = useState<string>();
  const [isNotice, setIsNotice] = useState<boolean>(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const defaultData: any = { token: localStorage.getItem("token") };

  const dropOut = (name: string) => {
    socket.emit("dropout", { ...defaultData, id, name });

    const newList: string[] = participants.filter((p) => p !== name);
    setParticipants(newList);
  };

  useEffect(() => {
    socket.emit("enterRoom", {
      ...defaultData,
      id,
    });
    socket.on("enterRoom", ({ name }) => {
      setNickname(name);
    });

    socket.on("kickedout", (name) => {
      if (name != nickname) return;
      alert("강퇴당하셨습니다.");
      window.location.href = "/";
    });
    socket.on("msgList", (data: any) => {
      console.log(data);
      setMessage(data);
    });
    socket.on("error", (data: any) => {
      console.log(data);
      alert(data.msg);
      window.location.href = "/";
    });
    socket.on("participants", ({ participants, master }) => {
      setMaster(master);
      setParticipants(participants);
    });
    socket.on("isMaster", () => setIsMaster(true));
  }, []);
  useEffect(() => {
    socket.on("notice", (data: Notice) => setNotice(data));
    socket.on("sendMsg", (data: Message) => setMessage([...message, data]));

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
      <button type="button" onClick={logout}>
        로그아웃
      </button>{" "}
      <br />
      <div className="main">
        <div style={{ width: "80%" }}>
          {notice && (
            <div className="notice">
              <strong>공지</strong> : {notice.notice} by.{notice.writer}{" "}
              {notice.time}
            </div>
          )}
          <div className="chat-list" ref={listRef}>
            {message.map(
              (
                m: { writer: string; msg: string; time: string },
                idx: number
              ) => {
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
        </div>
        <div className="participants">
          <table>
            <thead>
              <tr>
                <td>이름</td>
                {isMaster && <td>강퇴</td>}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{master}</td>
                {isMaster && <td />}
              </tr>
              {participants?.map((p: string) => (
                <tr>
                  <td>{p}</td>
                  {isMaster && master != p && (
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          dropOut(p);
                        }}
                      >
                        강퇴
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
