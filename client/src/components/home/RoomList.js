import React from "react";
import Room from "./Room";

import "./RoomList.css";
const RoomList = ({ rooms }) => {
  return (
    <div className="card__container ">
      {rooms &&
        rooms.map((room) => (
          <div>
            <Room
              name={room.name}
              id={room._id}
              description={room.description}
            />
          </div>
        ))}
    </div>
  );
};

export default RoomList;
