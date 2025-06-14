import React, { createContext, useState, useRef, useEffect ,useContext} from "react"
import { io } from "socket.io-client"
import Peer from "simple-peer"
import process from "process/browser"
// import { Buffer } from "buffer"
console.log("peer support ", Peer.WEBRTC_SUPPORT)

window.global = window
// window.Buffer = Buffer
window.process = process

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.continuous = true
recognition.interimResults = false
recognition.lang = "hi-IN" // Speak in Hindi to get English translation

const SocketContext = createContext()
export const useSocketContext = () =>useContext(SocketContext)
const BASEURL = "https://translateapi.educense.com/"

const socket = io(BASEURL)

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null)
  const [me, setMe] = useState("")
  const [call, setCall] = useState({})
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [Name, setName] = useState("")
  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()


const [recognizationResult,setRecognizationResult]  = useState([])

  const [translate, setTranslate] = useState(false)

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((currentStream) => {
        setStream(currentStream)

        myVideo.current.srcObject = currentStream
      })

    socket.on("me", (id) => setMe(id))

    socket.on("calluser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivedCall: true, from, name: callerName, signal })
    })
  }, [])

  const testSpeak = () => {
    const utterance = new SpeechSynthesisUtterance("hello testing ")
    utterance.lang = "en-US"
    speechSynthesis.speak(utterance)
  }

  // console.log(me);

  const answerCall = () => {
    setCallAccepted(true)

    const peer = new Peer({ initiator: false, trickle: true, stream: stream })

    addTranslateEvent(peer)

    peer.on("signal", (data) => {
      socket.emit("answercall", { signal: data, to: call.from })
    })

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream
    })

    peer.signal(call.signal)

    connectionRef.current = peer
  }

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream: stream })
    addTranslateEvent(peer)

    peer.on("signal", (data) => {
      console.log("data ", data)
      socket.emit("calluser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: Name,
      })
    })

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream
    })

    socket.on("callaccepted", (signal) => {
      setCallAccepted(true)

      peer.signal(signal)
    })

    connectionRef.current = peer
  }
  const addTranslateEvent = (peer) => {
    peer.on("data", (data) => {
      const decodedString = new TextDecoder().decode(data)
      console.log("decodedString", decodedString)
      const utterance = new SpeechSynthesisUtterance(decodedString)
      utterance.lang = "en-US"
      speechSynthesis.speak(utterance)
    })
  }
  const toogleTranslate = () => {
    const newValue = !translate
    setTranslate(newValue)

    if (stream.getAudioTracks().length) {
      stream.getAudioTracks()[0].enabled = translate
    }

    if (newValue && callAccepted) {
      //disablign audio trackf
      recognition.start()
      recognition.onresult = async (event) => {
        console.log("event")
        setRecognizationResult(event.results);
        const transcript = event.results[event.results.length - 1][0].transcript
        console.log("🗣️ Spoken:", transcript)

        try {
          const res = await fetch(`${BASEURL}translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: transcript,
              targetLang: "en", // Translate to English
            }),
          })

          const data = await res.json()
          console.log("data from server ", data)
          const translated = data.translatedText
          console.log("🔊 Translated:", translated)
          connectionRef.current.send(translated)
        } catch (err) {
          console.error("Translation failed:", err)
        }
      }

      recognition.onerror = (e) => console.error("STT error", e)
    } else {
      recognition.stop()
      recognition.onresult = () => {}
    }
  }

  const leaveCall = () => {
    setCallEnded(true)

    connectionRef.current.destroy()
    recognition.stop()
    speechSynthesis.cancel()
    window.location.reload()
  }

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        callEnded,
        stream,
        myVideo,
        userVideo,
        Name,
        setName,
        me,
        callUser,
        leaveCall,
        answerCall,
        translate,
        setTranslate,
        toogleTranslate,
        testSpeak,
        recognizationResult
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export { ContextProvider, SocketContext }
