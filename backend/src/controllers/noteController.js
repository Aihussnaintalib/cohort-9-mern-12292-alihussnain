
const Note = require('../models/Note');

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a valid title' });
    }
    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide valid content' });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Allow only specific fields
    const { title, content } = req.body;
    const updateData = {};
    if (title && typeof title === 'string' && title.trim().length > 0) {
      updateData.title = title.trim();
    }
    if (content && typeof content === 'string' && content.trim().length > 0) {
      updateData.content = content.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    note = await Note.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await note.deleteOne();
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { createNote, getNotes, getNote, updateNote, deleteNote };
