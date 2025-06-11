const app = require("express")()
const server = require("http").createServer(app)
const cors = require("cors")

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
})

console.log("process.env", process.env.GOOGLE_TRANSLATE_API_KEY)

app.use(cors())

app.get("/", (req, res) => {
  res.send("Welcome to HomePage")
})

io.on("connection", (socket) => {
  socket.emit("me", socket.id)
  // console.log(socket.id);

  socket.on("disconnect", (socket) => {
    console.log(socket)
  })

  socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("calluser", { signal: signalData, from, name })
  })

  socket.on("answercall", (data) => {
    io.to(data.to).emit("callaccepted", data.signal)
  })
})

// 🔄 Translation endpoint
app.post("/translate", async (req, res) => {
  const { text, targetLang } = req.body

  if (!text) {
    return res.status(400).json({ error: "Text is required" })
  }

  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: targetLang || "en",
        format: "text",
      }
    )

    const translatedText = response.data.data.translations[0].translatedText
    res.json({ translatedText })
  } catch (error) {
    console.error(
      "🔴 Translation API Error Response:",
      error.response?.data || error.message
    )
    res
      .status(500)
      .json({ error: "Translation failed", details: error.response?.data })
  }
})

const port = process.env.PORT || 5050
server.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}/`)
})
