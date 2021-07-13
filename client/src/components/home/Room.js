import React from "react";
import "./RoomList.css";
import { Link } from "react-router-dom";
const Room = ({ name, description, id }) => {
  console.log(name);
  return (
    <div className="cardss">
      <div className="card__content">
        <h3 className="card__header">{name}</h3>
        <p className="card__info">{description}</p>
        <Link to={"/chat/" + id + "/" + name} key={id}>
          <button className="card__button">Enter</button>
        </Link>
      </div>
    </div>
  );
};

export default Room;
