import React from "react";
import "./Input.css";
const Input = ({ message, setMessage, sendMessage }) => {
  return (
    <div>
      <form action="" onSubmit={sendMessage} className="form">
        <input
          type="text"
          className="inputsss"
          placeholder="Type a message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyPress={(event) =>
            event.key === "Enter" ? sendMessage(event) : null
          }
        />
        <button className="sendButton">
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default Input;
