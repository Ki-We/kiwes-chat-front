import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Chat from "./Chat";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./store/rootReducer";
import RoomComponent from "./Room";
import Test from "./Test";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const store = createStore(rootReducer);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/test" element={<Test />}></Route>
        <Route path="/chat/:id" element={<Chat />}></Route>
        <Route path="/room" element={<RoomComponent />}></Route>
      </Routes>
    </BrowserRouter>
  </Provider>
);
