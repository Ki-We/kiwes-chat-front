import { useRef, useEffect, useState } from "react";

import { socket } from "./utils/socket";
import { Room } from "./utils/interface";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

const App = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const nickname = useSelector((state: any) => state.user);

  useEffect(() => {
    socket.emit("entry", {});
    socket.on("roomList", (data) => {
      setRooms(data.rooms);
      console.log(data.rooms);
    });
    socket.on("error", (data: any) => alert(data.msg));
  }, []);
  const createRoom = () => {
    if (inputRef.current == null) return;

    socket?.emit("createRoom", { name: inputRef.current.value });
  };
  const sendNickname = async () => {
    if (nicknameRef.current == null) return;
    const name = nicknameRef.current.value;

    const url = `${process.env.REACT_APP_SERVER}/login`;
    const result = await axios
      .post(url, {
        name,
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.msg);
        return;
      });
    console.log(result);
    // socket.emit("nickname", { nickname });
    // dispatch(setName(nickname));
  };

  return (
    <>
      <div>
        {nickname != "" ? (
          <p>{nickname} 로그인 완료</p>
        ) : (
          <>
            {nickname}
            <input
              type="text"
              ref={nicknameRef}
              placeholder="이름"
              defaultValue={nickname}
            />
            <button type="button" onClick={sendNickname}>
              로그인
            </button>
          </>
        )}
      </div>

      {nickname != "" && (
        <>
          <div>
            <input
              type="text"
              ref={inputRef}
              name="roomName"
              placeholder="방 이름"
            />
            <button type="button" onClick={createRoom}>
              만들기
            </button>
          </div>

          <hr />

          <table border={1}>
            <tr>
              <th>방이름</th>
              <th>입장</th>
            </tr>
            {rooms?.map((room) => (
              <tr>
                <td>
                  {room.name} {room.is_new && <span>( New ) </span>}
                </td>
                <td>
                  <Link to={`/room/${room.id}`}>입장</Link>
                </td>
              </tr>
            ))}
          </table>
        </>
      )}
    </>
  );
};

export default App;
