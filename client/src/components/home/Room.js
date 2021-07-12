import React from "react";
import "./RoomList.css";
const Room = ({ name }) => {
  console.log(name);
  return (
    <div className="cardss">
      <div className="card__content">
        <h3 className="card__header">{name}</h3>
        <p className="card__info">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </p>
        <button className="card__button">Enter</button>
      </div>
    </div>
  );
};

export default Room;
