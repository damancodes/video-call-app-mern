import React, { useContext } from "react";
import {
  Grid,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { SocketContext } from "../../SocketContext";
import "./VideoPlayer.css";

const VideoPlayer = () => {
  const {
    call,
    callAccepted,
    callEnded,
    stream,
    myVideo,
    userVideo,
    Name,
    translate,
    toogleTranslate,
    testSpeak,
  } = useContext(SocketContext);

  return (
    <Grid container className="gridContainer">
      <button onClick={testSpeak}>Test Speak</button>
      {/* OWN Video */}
      {callAccepted && (
        <Grid
          item
          xs={12}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={translate}
                onChange={toogleTranslate}
                color="success"
              />
            }
            sx={{ color: "white" }}
            label="Translate"
          />
        </Grid>
      )}

      {stream && (
        <Paper className="paper">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {" "}
              {Name || "Name"}{" "}
            </Typography>
            <video playsInline muted ref={myVideo} autoPlay className="video" />
          </Grid>
        </Paper>
      )}

      {/* Users Video */}

      {callAccepted && !callEnded && (
        <Paper className="paper">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {" "}
              {call.name || "Name"}{" "}
            </Typography>
            <video playsInline ref={userVideo} autoPlay className="video" />
          </Grid>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;
