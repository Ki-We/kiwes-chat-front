import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Chat from "./Chat";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./store/rootReducer";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const store = createStore(rootReducer);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/room/:id" element={<Chat />}></Route>
      </Routes>
    </BrowserRouter>
  </Provider>
);
