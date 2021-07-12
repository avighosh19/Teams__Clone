import React from "react";
import Room from "./Room";
import { Link } from "react-router-dom";
import "./RoomList.css";
const RoomList = ({ rooms }) => {
  return (
    <div className="card__container ">
      {rooms &&
        rooms.map((room) => (
          <Link to={"/chat/" + room._id + "/" + room.name} key={room._id}>
            <div>
              <Room name={room.name} />
            </div>
          </Link>
        ))}
    </div>
  );
};

export default RoomList;
