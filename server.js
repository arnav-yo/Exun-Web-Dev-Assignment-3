require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const mongoURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("connected to db");

    app.listen(port, () => {
      console.log("listening on port", port);
    });
  })
  .catch((err) => {
    console.log("you got an error while connecting to db", err);
  });

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

const Note = mongoose.model("Note", noteSchema);

const getNote = async (request, res, next) => {
  let note;
  try {
    note = await Note.findById(request.params.id);
    if (!note) {
      return res.status(404).json({
        message:
          "couldn't find a note with the id that you have provided please recheck.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: `Its a fault on the server's end. Here's the error ${err.message}`,
    });
  }
  res.note = note;
  next();
};

app.get("/notes", async (request, res) => {
  try {
    const allNotes = await Note.find();
    res.status(200).json(allNotes);
  } catch (err) {
    res
      .status(500)
      .json({
        message: `Its an error on our end. The error is ${err.message}`,
      });
  }
});

app.post("/notes", async (request, res) => {
  try {
    const newNote = new Note(request.body);
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch("/notes/:id", getNote, async (request, res) => {
  if (request.body.title != null) {
    res.note.title = request.body.title;
  }
  if (request.body.description != null) {
    res.note.description = request.body.description;
  }

  res.note.date = Date.now();

  try {
    const updatedNote = await res.note.save();
    res.status(200).json(updatedNote);
  } catch (err) {
    res.status(400).json({
      message: `Its an error on your end. The error is ${err.message}`,
    });
  }
});

app.delete("/notes/:id", getNote, async (request, res) => {
  try {
    await res.note.deleteOne();
    res
      .status(200)
      .json({ message: "Your Note has been deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: `Its an error on our end. The error is ${err.message}`,
    });
  }
});
