import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { socket } from "./utils/socket";
import { Room } from "./utils/interface";
import axios from "axios";

export default function RoomComponent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myrooms, setMyRooms] = useState<Room[]>([]);

  useEffect(() => {
    initialize();
    socket.emit("entry", {});
    socket.on("roomList", (data) => {
      setRooms(data.rooms);
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

    socket?.emit("createRoom", { name: inputRef.current.value });
  };
  return (
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
            <td>
              {room.name} {room.is_new && <span>( New ) </span>}
            </td>
            <td>
              <Link to={`/chat/${room.id}`}>입장</Link>
            </td>
          </tr>
        ))}
      </table>
    </>
  );
}
