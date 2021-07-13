import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import NotesList from "./NotesList";
import Search from "./Search";

import { UserContext } from "../../UserContext";
import "./note.css";
import { makeStyles } from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import { useHistory, useLocation } from "react-router-dom";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import PeopleIcon from "@material-ui/icons/People";
import NoteAddIcon from "@material-ui/icons/NoteAdd";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => {
  return {
    root: {
      display: "flex",
    },
    drawer: {
      width: drawerWidth,
    },
    drawerPaper: {
      width: drawerWidth,
      background: "#464775",

      color: "white",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 3, 3),
    },
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    active: {
      background: "#8D8C8C",
      marginTop: 22,
      borderRadius: 15,
    },
    title: {
      padding: theme.spacing(1),
      paddingBottom: theme.spacing(3),
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      background: "#464775",
    },
    date: {
      flexGrow: 1,
    },
    toolbar: theme.mixins.toolbar,
    avatar: {
      marginLeft: theme.spacing(2),
    },
    backdrops: {
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
    buttonSwitch: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(0),
      marginLeft: theme.spacing(150),
      backgroundColor: "#464775",
      color: "white",
    },
  };
});

const Notess = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const menuItems = [
    {
      text: "Teams",
      icon: <PeopleIcon color="#CDCDCD" />,
      path: "/",
    },
    {
      text: "Create Teams",
      icon: <AddCircleIcon color="#CDCDCD" />,
      path: "/create",
    },
    {
      text: "Add Notes",
      icon: <NoteAddIcon color="#CDCDCD" />,
      path: "/notes",
    },
  ];
  const [notes, setNotes] = useState([
    {
      id: nanoid(),
      text: "This is my first note!",
      date: "12/07/2021",
    },
    {
      id: nanoid(),
      text: "This is my second note!",
      date: "13/07/2021",
    },
    {
      id: nanoid(),
      text: "This is my third note!",
      date: "13/07/2021",
    },
  ]);

  const [searchText, setSearchText] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("react-notes-app-data"));

    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("react-notes-app-data", JSON.stringify(notes));
  }, [notes]);

  const addNote = (text) => {
    const date = new Date();
    const newNote = {
      id: nanoid(),
      text: text,
      date: date.toLocaleDateString(),
    };
    const newNotes = [...notes, newNote];
    setNotes(newNotes);
  };

  const deleteNote = (id) => {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
  };

  return (
    <div className="container">
      <div>
        <div className={classes.root}>
          {/* side drawer */}
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{ paper: classes.drawerPaper }}
            anchor="left"
          >
            <div className="img_title_box">
              <div>
                <img
                  className="teams____logo"
                  src="https://cdn.worldvectorlogo.com/logos/microsoft-teams.svg"
                />
              </div>
              <Typography variant="h5" className={classes.title}>
                Teams
              </Typography>
            </div>

            {/* links/list section */}
            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => history.push(item.path)}
                  className={
                    location.pathname == item.path ? classes.active : null
                  }
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Drawer>
        </div>
        <br />
        <Search handleSearchNote={setSearchText} />
        <br />
        <NotesList
          notes={notes.filter((note) =>
            note.text.toLowerCase().includes(searchText)
          )}
          handleAddNote={addNote}
          handleDeleteNote={deleteNote}
        />
      </div>
    </div>
  );
};

export default Notess;
