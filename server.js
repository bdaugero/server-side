const mongoose = require("mongoose")
const Document = require("./Document")

mongoose.connect("mongodb://localhost/google-docs")

const io = require("socket.io")(3001, {
    cors: {
      origin: "https://archivos-compartidos.netlify.app/documents/829fa418-4304-4b2a-97d4-ffbda9fdb8a5",
      methods: ["GET", "POST"],
    },
  })

const defaultValue = ""

io.on("connection", socket => {
  socket.on('get-document', async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on('send-changes', delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue})
}