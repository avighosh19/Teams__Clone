import React, { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Room from "./routes/Room";
import Chat from "./components/chat/Chat";
import Home from "./components/home/Home";
import Navbar from "./components/layout/Navbar";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("/verifyuser", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.log(error);
      }
    };
    verifyUser();
  }, []);
  return (
    <BrowserRouter>
      <UserContext.Provider value={{ user, setUser }}>
        <Navbar />
        <Switch>
          <Route exact path="/" component={Home} />

          <Route path="/chat/:room_id/:room_name" component={Chat} />

          <Route path="/signup" component={Signup} />

          <Route path="/login" component={Login} />

          <Route path="/video/room/:roomID" component={Room} />
        </Switch>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
