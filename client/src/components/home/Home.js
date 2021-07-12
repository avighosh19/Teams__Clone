import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../UserContext";
import { Redirect } from "react-router-dom";
import RoomList from "./RoomList";
import io from "socket.io-client";
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
      padding: theme.spacing(2, 4, 3),
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
const Home = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { user, setUser } = useContext(UserContext);
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);

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
      text: "Chat ",
      icon: <AddCircleIcon color="#CDCDCD" />,
      path: "/create",
    },
  ];
  useEffect(() => {
    socket = io("/");
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, ["/"]);
  useEffect(() => {
    socket.on("output-rooms", (rooms) => {
      setRooms(rooms);
    });
  }, []);
  useEffect(() => {
    socket.on("room-created", (room) => {
      setRooms([...rooms, room]);
    });
  }, [rooms]);
  useEffect(() => {
    console.log(rooms);
  }, [rooms]);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("create-room", room);
    console.log(room);
    setRoom("");
  };

  if (!user) {
    return <Redirect to="/login" />;
  }
  return (
    <div>
      <div className={classes.root}>
        {/* app bar */}
        <AppBar
          position="fixed"
          className={classes.appBar}
          elevation={0}
          color="primary"
        >
          <Toolbar>
            <Typography className={classes.date}>
              Today is the {format(new Date(), "do MMMM Y")}
            </Typography>
            <Typography>{user ? user.name : "avi"}</Typography>

            <Avatar className={classes.avatar} src="/mario-av.png" />
          </Toolbar>
        </AppBar>

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

      <Button
        variant="outlined"
        type="button"
        className={classes.buttonSwitch}
        onClick={handleOpen}
      >
        Create Team
      </Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.backdrops}>
            <h2 id="transition-modal-title">Create Team</h2>
            <p id="transition-modal-description">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="input-field col s12">
                    <input
                      placeholder="Enter a room name"
                      id="room"
                      type="text"
                      className="validate"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                    />
                    <label htmlFor="room">Room</label>
                  </div>
                </div>
                <button className="btn">Create Room</button>
              </form>
            </p>
          </div>
        </Fade>
      </Modal>
      <br />
      <div className="container">
        <RoomList rooms={rooms} />
      </div>
    </div>
  );
};

export default Home;
