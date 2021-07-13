import React from "react";
import { MdSearch } from "react-icons/md";

import "./note.css";

const Search = ({ handleSearchNote }) => {
  return (
    <div>
      <h3>Notes</h3>

      <div className="search">
        <MdSearch className="search-icons" size="1.3em" />
        <input
          onChange={(event) => handleSearchNote(event.target.value)}
          type="text"
          placeholder="type to search..."
        />
      </div>
    </div>
  );
};

export default Search;
