import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { socket } from "./utils/socket";
import { Room } from "./utils/interface";
import axios from "axios";
import { logout } from "./utils/common";

export default function RoomComponent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myrooms, setMyRooms] = useState<Room[]>([]);

  const defaultData: any = { token: localStorage.getItem("token") };

  useEffect(() => {
    // 최초 socket 연결
    socket.emit("entry", defaultData);
    initialize();

    socket.on("getMyRooms", (data: any) => {
      // data = { rooms: [ { Room } ]}
      setMyRooms(data.rooms);
      console.log(data.rooms);
    });
    socket.on("error", (data: any) => alert(data.msg));
  }, []);
  const initialize = async () => {
    const url = `${process.env.REACT_APP_SERVER}/rooms`;
    const result = await axios
      .get(url)
      .then((res) => res.data)
      .catch((err) => {
        alert(err.response.data.msg);
        return;
      });
    setRooms(result.rooms);
  };

  const createRoom = () => {
    if (inputRef.current == null) return;

    socket?.emit("createRoom", {
      ...defaultData,
      name: inputRef.current.value,
    });
    /**
     * 실제 사용되지 않을 로직
     */
    socket.on("createNewRoom", (data) => setRooms([...rooms, data.room]));
  };
  return (
    <>
      <button type="button" onClick={logout}>
        로그아웃
      </button>{" "}
      <br />
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
      <h5>내가 참여한 목록</h5>
      <table border={1}>
        <tr>
          <th>방이름</th>
          <th>입장</th>
        </tr>
        {myrooms?.map((room) => (
          <tr>
            <td>
              {room.name} {room.is_new && <span>( New ) </span>}
            </td>
            <td>
              <Link to={`/chat/${room.id}`}>입장</Link>
            </td>
          </tr>
        ))}
      </table>
      <h5>전체 방 목록</h5>
      <table border={1}>
        <tr>
          <th>방이름</th>
          <th>입장</th>
        </tr>
        {rooms?.map((room) => (
          <tr>
            <td>{room.name}</td>
            <td>
              <Link to={`/chat/${room.id}`}>참가하기</Link>
            </td>
          </tr>
        ))}
      </table>
    </>
  );
}
