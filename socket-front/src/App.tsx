import { useRef, useEffect, useState } from "react";

import { socket } from "./utils/socket";
import { Room } from "./utils/interface";
import { Link } from "react-router-dom";

const App = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  useEffect(() => {
    socket.emit("entry", {});
    socket.on("roomList", (data) => setRooms(data.rooms));
  }, []);
  const inputRef = useRef<HTMLInputElement>(null);
  const createRoom = () => {
    if (inputRef.current == null) return;

    socket?.emit("createRoom", { name: inputRef.current.value });
  };
  const enterRoom = (id: number) => {
    socket.emit("enterRoom", { id });
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

      <table border={1}>
        <tr>
          <th>방이름</th>
          <th>입장</th>
        </tr>
        {rooms?.map((room) => (
          <tr>
            <td>{room.name}</td>
            <td>
              <Link to={`/room/${room.id}`}>입장</Link>
            </td>
          </tr>
        ))}
      </table>
    </>
  );
};

export default App;
