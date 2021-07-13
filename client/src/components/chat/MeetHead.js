import React, { useState } from "react";
import "./meetHead.css";

const MeetHead = ({ handleHeading }) => {
  const [MeetHead, setMeetHead] = useState("");
  const characterLimit = 12;

  const handleChange = (event) => {
    if (characterLimit - event.target.value.length >= 0) {
      setMeetHead(event.target.value);
    }
  };

  const handleSaveClick = () => {
    if (MeetHead.trim().length > 0) {
      handleHeading(MeetHead);
      setMeetHead("");
    }
  };

  return (
    <div class="login-box">
      <h2>Start The Meet</h2>
      <form>
        <div class="user-box">
          <label className="meettitlwe">Meet Title</label>
          <input
            type="text"
            name=""
            required=""
            value={MeetHead}
            onChange={handleChange}
          />
        </div>

        <button onClick={handleSaveClick}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          Submit
        </button>
      </form>
    </div>
  );
};

export default MeetHead;
