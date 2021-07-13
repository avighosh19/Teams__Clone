import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../UserContext";
import { Link, useParams } from "react-router-dom";
import io from "socket.io-client";
import Messages from "./messages/Messages";
import Input from "./input/Input";
import "./Chat.css";
import MeetHead from "./MeetHead";
import { makeStyles } from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import { useHistory, useLocation } from "react-router-dom";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import PeopleIcon from "@material-ui/icons/People";
import ChatIcon from "@material-ui/icons/Chat";
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
let socket;
const Chat = (props) => {
  const { user, setUser } = useContext(UserContext);
  let { room_id, room_name, description } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
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
      text: "Chat",
      icon: <ChatIcon color="#CDCDCD" />,
      path: `/chat/${room_id}/${room_name}`,
    },
    {
      text: "Add Notes",
      icon: <NoteAddIcon color="#CDCDCD" />,
      path: "/notes",
    },
  ];

  const [Meeting, setMeeting] = useState({
    meet: "",
  });

  useEffect(() => {
    socket = io("/");
    socket.emit("join", { name: user.name, room_id, user_id: user._id });
  }, []);
  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });
  }, [messages]);
  useEffect(() => {
    socket.emit("get-messages-history", room_id);
    socket.on("output-messages", (messages) => {
      setMessages(messages);
    });
  }, []);

  useEffect(() => {
    const savedMeet = JSON.parse(localStorage.getItem("createMeet"));

    if (savedMeet) {
      setMeeting(savedMeet);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("createMeet", JSON.stringify(Meeting));
  }, [Meeting]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      console.log(message);
      socket.emit("sendMessage", message, room_id, () => setMessage(""));
    }
  };
  function create() {
    const id = room_id;
    props.history.push(`/video/room/${id}/${room_name}`);
  }

  const addMeet = (text) => {
    const newNote = {
      meet: text,
    };

    const newMeet = [...Meeting, setMeeting];
    setMeeting(newMeet);
  };
  return (
    <div className="outerContainer">
      <div>
        <div className={classes.root}>
          {/* side drawer */}
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{ paper: classes.drawerPaper }}
            anchor="left"
          >
            <div className="img_title__box">
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
      </div>
      <div className="containeers">
        <div className="Chat__head_name">
          <span>{room_name}</span>
          <a href="/">
            <i class="fas fa-sign-out-alt"></i>
          </a>
        </div>
        <Messages messages={messages} user_id={user._id} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
      <div className="box1">
        <div className="box1__up">
          <div className="head__avatar">
            <i class="fas fa-user-tie"></i>
          </div>
          <b> {user.name} </b>
        </div>
        <br />
        <br />

        <div className="Container2">
          <br />

          <div className="Container4">
            <h5> Create the Meetings</h5>
          </div>

          <br />
          <div className="Container3">
            <div>
              <button className="btn-maded" onClick={create}>
                Join Meet
              </button>
            </div>

            <div>
              <button className="btn-maded" onClick={create}>
                Start Meet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
