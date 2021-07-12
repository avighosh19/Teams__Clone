import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../UserContext";
import { Link, useParams } from "react-router-dom";
import io from "socket.io-client";
import Messages from "./messages/Messages";
import Input from "./input/Input";
import "./Chat.css";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
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
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { format } from "date-fns";
import Avatar from "@material-ui/core/Avatar";

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
    },
    title: {
      padding: theme.spacing(2),
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
  let { room_id, room_name } = useParams();
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
      text: "Create Teams",
      icon: <AddCircleIcon color="#CDCDCD" />,
      path: "/create",
    },
  ];

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
  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      console.log(message);
      socket.emit("sendMessage", message, room_id, () => setMessage(""));
    }
  };
  function create() {
    const id = room_id;
    props.history.push(`/video/room/${id}`);
  }
  return (
    <div className="outerContainer">
      Chat
      <div>
        <div className={classes.root}>
          {/* side drawer */}
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{ paper: classes.drawerPaper }}
            anchor="left"
          >
            <div>
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
      <div className="container">
        <Messages messages={messages} user_id={user._id} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
      <div className="Container2">
        <h6>
          Hi <b>{user.name}</b> Create the Meetings
        </h6>
        <br />
        <button className="btn-made" onClick={create}>
          Video Chat
        </button>
      </div>
    </div>
  );
};

export default Chat;
