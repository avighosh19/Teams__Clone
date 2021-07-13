import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useHistory, useLocation } from "react-router-dom";
import Peer from "simple-peer";
import styled from "styled-components";
import "./rooms.css";
const Page = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  align-items: center;

  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 500px;
  overflow: auto;
  width: 100%;
  border-right: 1px solid #7884ef;
  border-left: 1px solid #7884ef;
  border-radius: 10px;
  padding-bottom: 10px;
  margin-top: 25px;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 50px;
  border-radius: 10px;
  margin-bottom: 8px;
  margin-top: 15px;
  block: inline;
  padding-top: 10px;
  font-size: 17px;
  background-color: transparent;
  border-right: 1px solid #7884ef;
  border-left: 1px solid #7884ef;
  outline: none;
  color: #fff;
  letter-spacing: 1px;
  line-height: 20px;
  ::placeholder {
    color: Chat;
  }
`;

const Button = styled.button`
  block: inline;
  background-color: #7884ef;
  border: none;
  height: 40px;
  align-items: center;
  border-radius: 10px;
  color: #46516e;
  font-size: 17px;
`;

const Form = styled.form`
  width: 38vmin;
  height: 100px;
  background-color: #464775;
`;
const MyRow1 = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;
const MyMessage1 = styled.div`
  width: 45%;
  background-color: #cdd1ff;
  color: rgba(0, 0, 0, 0.6);
  padding: 10px;
  margin-right: 5px;
  text-align: center;
  border-top-right-radius: 10%;
  border-radius: 10px;
`;
const PartnerRow1 = styled(MyRow1)`
  justify-content: flex-start;
`;
const PartnerMessage1 = styled.div`
  width: 45%;
  background-color: transparent;
  color: lightgray;
  border: 1px solid lightgray;
  padding: 10px;
  margin-left: 5px;
  text-align: center;
  border-top-left-radius: 10%;
  border-bottom-left-radius: 10%;
`;

const StyledVideo = styled.video`
  width: 25vw;
  height: 35vh;
  object-fit: cover;
  border-radius: 10%;
  padding: 10px;
  margin: 0 10px;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};
let myVideoStream;

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  let history = useHistory();
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = props.match.params.roomID;
  const roomName = props.match.params.roomName;
  const userStream = useRef();
  const senders = useRef([]);
  const [yourID, setYourID] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [count, setCount] = useState(0);

  useEffect(() => {
    socketRef.current = io.connect("/");
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        myVideoStream = stream;
        userVideo.current.srcObject = stream;
        socketRef.current.emit("join room", roomID);

        socketRef.current.on("all users", (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);

            peersRef.current.push({
              peerID: userID,

              peer,
            });

            peers.push({
              peerID: userID,
              peer,
            });
          });
          setPeers(peers);
        });

        socketRef.current.on("your id", (id) => {
          setYourID(id);
        });

        socketRef.current.on("message", (message) => {
          console.log("here");
          receivedMessage(message);
        });

        socketRef.current.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
          const peerObj = { peer, peerID: payload.callerID };

          setPeers((users) => [...users, peerObj]);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
        socketRef.current.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }

          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
        });
      });
  }, []);

  function receivedMessage(message) {
    setMessages((oldMsgs) => [...oldMsgs, message]);
  }

  function sendMessage(e) {
    e.preventDefault();
    const messageObject = {
      body: message,
      id: yourID,
    };
    setMessage("");
    socketRef.current.emit("send message", messageObject);
  }

  function handleChange(e) {
    setMessage(e.target.value);
  }

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function shareScreen() {
    navigator.mediaDevices
      .getDisplayMedia({ cursor: true })
      .then((screenStream) => {
        peersRef.current.replaceTrack(
          myVideoStream.getVideoTracks()[0],
          screenStream.getVideoTracks()[0],
          myVideoStream
        );
        userVideo.current.srcObject = screenStream;
        screenStream.getTracks()[0].onended = () => {
          peersRef.current.replaceTrack(
            screenStream.getVideoTracks()[0],
            myVideoStream.getVideoTracks()[0],
            myVideoStream
          );
          userVideo.current.srcObject = myVideoStream;
        };
      });
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const muteUnmute = () => {
    console.log("objeasdasdact");
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  };

  const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo();
    } else {
      setStopVideo();
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  };

  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `;
    document.querySelector(".main__mute__button").innerHTML = html;
  };

  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `;
    document.querySelector(".main__mute__button").innerHTML = html;
  };

  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `;
    document.querySelector(".main__video_button").innerHTML = html;
  };

  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `;
    document.querySelector(".main__video_button").innerHTML = html;
  };

  function handleClick() {
    history.push(`/chat/${roomID}/${roomName}`);
  }

  return (
    <div className="mainss">
      <div className="main__left">
        <div className="meet_head">
          <div className="meet_head_left">
            <img
              className="teams___logo"
              src="https://cdn.worldvectorlogo.com/logos/microsoft-teams.svg"
            />
          </div>
          <div className="meet_head_right">
            <h3>Welcome to Meeting</h3>
          </div>
        </div>
        <div className="main__videos contaiiinerss">
          <div id="videoDiv">
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer) => {
              return <Video key={peer.peerID} peer={peer.peer} />;
            })}
            .
          </div>
        </div>
        <div className=" main__controls">
          <div className="main__controls__block">
            <div
              onClick={muteUnmute}
              className="main__controls__button main__mute__button"
            >
              <div className="circle">
                <i className="fas fa-microphone"></i>
              </div>

              <span>Mute</span>
            </div>
            <div
              onClick={playStop}
              className="main__controls__button main__video_button"
            >
              <div className="circle">
                <i className="fas fa-video"></i>
              </div>

              <span>Stop Video</span>
            </div>
          </div>
          <div className="main__controls__block">
            <div onClick={shareScreen} className="main__controls__button">
              <div className="circle">
                <span className="present">
                  <i className="fas fa-desktop"></i>
                </span>
              </div>
              <span>Present</span>
            </div>

            <div onClick={handleClick} className="main__controls__button">
              <div className="circle">
                <i className="fas fa-comment-alt"></i>
              </div>
              <span>Chat</span>
            </div>
          </div>
          <div className="main__controls__block">
            <a href="/">
              <div className="main__controls__button">
                <div className="circle">
                  <span className="leave_meeting">
                    <i className="fas fa-phone"></i>
                  </span>
                </div>

                <span>Leave</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="main__right">
        <div className="main__header">
          <ul>
            <h4>Chat</h4>
          </ul>
        </div>
        <Page>
          <Container>
            {messages.map((message, index) => {
              if (message.id === yourID) {
                return (
                  <MyRow1 key={index}>
                    <MyMessage1>{message.body}</MyMessage1>
                  </MyRow1>
                );
              }
              return (
                <PartnerRow1 key={index}>
                  <PartnerMessage1>{message.body}</PartnerMessage1>
                </PartnerRow1>
              );
            })}
          </Container>
          <Form onSubmit={sendMessage}>
            <TextArea
              value={message}
              onChange={handleChange}
              placeholder="Say something..."
            />
            <Button>Send</Button>
          </Form>
        </Page>
      </div>
    </div>
  );
};

export default Room;
