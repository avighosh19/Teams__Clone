import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import "./rooms.css";
import Chat from "../components/chat/Chat";
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

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = props.match.params.roomID;
  const userStream = useRef();
  const senders = useRef([]);

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

            peers.push(peer);
          });
          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users) => [...users, peer]);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      });
  }, []);

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

  return (
    <div className="mainss">
      <div className="main__left">
        <div className="meet_head">
          <div className="meet_head_left">
            <h4>Teams</h4>
          </div>
          <div className="meet_head_right">
            <h3>Meet head</h3>
          </div>
        </div>
        <div className="main__videos containerss">
          <div id="videoDiv">
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
              return <Video key={index} peer={peer} />;
            })}
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

            <div className="main__controls__button">
              <div className="circle">
                <i className="fas fa-comment-alt"></i>
              </div>
              <span>Chat</span>
            </div>
          </div>
          <div className="main__controls__block">
            <div className="main__controls__button">
              <div className="circle">
                <span className="leave_meeting">
                  <i className="fas fa-phone"></i>
                </span>
              </div>

              <span>Leave</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main__right">
        <div className="main__header">
          <h4>Chat</h4>
        </div>
        <div className="main__chat_window">
          <ul className="messages"></ul>
        </div>
        <div className="main__message_container">
          <input
            id="chat_message"
            type="text"
            placeholder="Type message here..."
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
