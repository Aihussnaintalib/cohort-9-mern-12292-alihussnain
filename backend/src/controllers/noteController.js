const Note = require('../models/Note');
const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeContent = (content) => {
  return sanitizeHtml(content, {
    allowedTags: [
      'p', 'br', 'b', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code',
      'pre', 'a', 'img', 'strong', 'em',
      'span', 'div', 'table', 'thead', 'tbody',
      'tr', 'th', 'td'
    ],
    allowedAttributes: {
      a: ['href', 'target'],
      img: ['src', 'alt', 'width', 'height'],
      '*': ['class', 'style']
    },
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    },
    allowedIframeHostnames: [],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank' })
    }
  });
};

const hasValidContent = (sanitized) => {
  if (!sanitized) return false;
  const textContent = sanitized.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
  const imgRegex = /<img[^>]*src=["']([^"']*)["']/g;
  let match;
  let hasValidImage = false;
  while ((match = imgRegex.exec(sanitized)) !== null) {
    if (match[1] && match[1].trim().length > 0) {
      hasValidImage = true;
      break;
    }
  }
  return textContent.length > 0 || hasValidImage;
};

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a valid title' });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide valid content' });
    }

    const sanitizedContent = sanitizeContent(content);
    if (!hasValidContent(sanitizedContent)) {
      return res.status(400).json({ message: 'Please provide meaningful content' });
    }

    const note = await Note.create({
      title: title.trim(),
      content: sanitizedContent,
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    
    const MAX_PAGE = 1000;
    const MAX_LIMIT = 100;
    
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > MAX_PAGE ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > MAX_LIMIT
    ) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }
    
    const skip = (page - 1) * limit;

    const notes = await Note.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Note.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

const getNote = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note id' });
    }
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note id' });
    }
    
    const { title, content } = req.body;
    const updateData = {};
    if (title && typeof title === 'string' && title.trim().length > 0) {
      updateData.title = title.trim();
    }
    if (content && typeof content === 'string' && content.trim().length > 0) {
      const sanitizedContent = sanitizeContent(content);
      if (!hasValidContent(sanitizedContent)) {
        return res.status(400).json({ message: 'Please provide meaningful content' });
      }
      updateData.content = sanitizedContent;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note id' });
    }
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createNote, getNotes, getNote, updateNote, deleteNote };