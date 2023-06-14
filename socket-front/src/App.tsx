import { useRef, useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [name, setName] = useState("");
  const sendNickname = async () => {
    const url = `${process.env.REACT_APP_SERVER}/login`;
    const result = await axios
      .post(url, {
        name,
      })
      .then((res) => res.data)
      .catch((err) => {
        console.log(err);
        alert(err.response.data.msg);
        return;
      });

    localStorage.setItem("token", result.token);
    location.href = "/room";
  };

  return (
    <>
      <input
        type="text"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <button type="button" onClick={sendNickname}>
        로그인
      </button>
    </>
  );
};

export default App;
