require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const Tesseract = require('tesseract.js');
const authRoutes = require('./routes/authRoutes');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'honduras_archive-v3_dev_secret';

// Helper function to safely escape strings for Regex injection safety
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://honduras-archive-v3-1.onrender.com',
  credentials: true
}));

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'honduras_archive_dev', allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'] }
});
const upload = multer({ storage });

// MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  }
};
connectDB();

// ── Archive Schema ────────────────────────────────────────────────────────────
const archiveSchema = new mongoose.Schema({
  title: String,
  names: [String],
  summary: String,
  fullText: String,
  category: String,
  location: String,
  eventDate: String,
  publicationDate: String,
  newspaperName: String,
  countryOfOrigin: String,
  pageNumber: String,
  imageUrl: String,
  cloudinaryId: String,
  eventName: String,
  peopleInvolved: [String],
  businessName: String,
  businessType: String,
  owner: String,
  yearFounded: String,
  createdAt: { type: Date, default: Date.now }
});
const Archive = mongoose.model('Archive', archiveSchema);

app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.send('Honduras Archive API'));

// ── GET all records (with pagination & regex safety) ───────────────────────────
app.get('/api/archive', async (req, res) => {
  try {
    const { search, letter, category, page = 1, limit = 20 } = req.query;
    let query = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      const searchConditions = [
        { names: { $regex: safeSearch, $options: 'i' } },
        { countryOfOrigin: { $regex: safeSearch, $options: 'i' } },
        { summary: { $regex: safeSearch, $options: 'i' } },
        { eventName: { $regex: safeSearch, $options: 'i' } },
        { peopleInvolved: { $regex: safeSearch, $options: 'i' } },
        { businessName: { $regex: safeSearch, $options: 'i' } },
        { owner: { $regex: safeSearch, $options: 'i' } },
        { businessType: { $regex: safeSearch, $options: 'i' } },
      ];
      
      if (category) {
        query = { category, $or: searchConditions };
      } else {
        query = { $or: searchConditions };
      }
    } else if (letter && letter !== 'null') {
      query = { names: { $elemMatch: { $regex: '^' + escapeRegex(letter), $options: 'i' } } };
    } else if (category) {
      query = { category };
    }

    // Execute paginated queries in parallel for peak performance
    const [items, totalCount, lastRecord] = await Promise.all([
      Archive.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Archive.countDocuments(query), // Fixed: counts the matching results now
      Archive.findOne().sort({ createdAt: -1 })
    ]);

    res.json({ 
      items, 
      totalCount, 
      lastUpdate: lastRecord ? lastRecord.createdAt : null,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Date normalization → Chicago-style "DD Month YYYY", preserving source language ──
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MONTHS_EN = ['january','february','march','april','may','june','july','august','september','october','november','december'];
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const fullYear = (y) => y.length === 2 ? (parseInt(y, 10) > 30 ? '18' + y : '19' + y) : y;

const normalizeDate = (raw) => {
  if (!raw) return '';

  // "8 de septiembre de 1917" / "8 septiembre 1917"
  let m = raw.match(/(\d{1,2})\s*(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s*(?:de\s+)?(\d{2,4})/i);
  if (m) return `${parseInt(m[1], 10)} ${capitalize(m[2])} ${fullYear(m[3])}`;

  // "September 8, 1917" / "September 8 1917"
  m = raw.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{1,2}),?\s*(\d{2,4})/i);
  if (m) return `${parseInt(m[2], 10)} ${capitalize(m[1])} ${fullYear(m[3])}`;

  // "8 September 1917" (already day-first)
  m = raw.match(/(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{2,4})/i);
  if (m) return `${parseInt(m[1], 10)} ${capitalize(m[2])} ${fullYear(m[3])}`;

  // Numeric "8/9/1917" — assumes DD/MM/YYYY (Latin American convention), outputs Spanish month name
  m = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const idx = parseInt(m[2], 10) - 1;
    const monthName = MONTHS_ES[idx] ? capitalize(MONTHS_ES[idx]) : m[2];
    return `${parseInt(m[1], 10)} ${monthName} ${fullYear(m[3])}`;
  }

  return raw; // unrecognized format — return as-is rather than losing data
};
// ── POST scan ─────────────────────────────────────────────────────────────────
app.post('/api/archive/scan', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    console.log('🔍 Starting OCR on:', req.file.path);
    const { data: { text } } = await Tesseract.recognize(
      req.file.path, 'spa+eng',
      { logger: m => console.log(m.status) }
    );
    const extractedText = text.trim();
    res.json({
      fullText: extractedText,
      summary: extractedText.substring(0, 200),
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename
    });
  } catch (error) {
    console.error('❌ OCR error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── POST analyze ──────────────────────────────────────────────────────────────
app.post('/api/archive/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const { data: { text } } = await Tesseract.recognize(req.file.path, 'spa+eng');

    const fullText = text.trim().replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');
    const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
    const lower = fullText.toLowerCase();
    const category = req.body.category || 'News';

    const dateRegex = /\b(\d{1,2}[\s\/\-](?:de\s)?(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|january|february|march|april|may|june|july|august|september|october|november|december)[\s\/\-](?:de\s)?\d{2,4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi;
    const dates = [...fullText.matchAll(dateRegex)].map(m => m[0]);

    const pageMatch = fullText.match(/p[áa]g(?:ina)?\.?\s*(\d+)/i);
    const pageNumber = pageMatch ? pageMatch[1] : '';

    const knownPapers = ['El Cronista','La Prensa','El Heraldo','El Tiempo','La Tribuna','La Gaceta'];
    let newspaperName = knownPapers.find(paper => lower.includes(paper.toLowerCase())) || (lines[0] && lines[0].length < 60 ? lines[0] : '');

    const cities = ['Tegucigalpa','San Pedro Sula','La Ceiba','Comayagua','Choluteca'];
    let location = cities.find(city => fullText.includes(city)) || '';

    const nameRegex = /\b([A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]{2,}(?:\s[A-ZÁÉÍÓÚÑÜ]\.?){0,2}(?:\s[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]{2,})+)\b/g;
    const stopWords = ['Honduras','Tegucigalpa','Republica','Gobierno','Enero','Febrero'];
    const nameMatches = [...fullText.matchAll(nameRegex)].map(m => m[0]).filter(n => !stopWords.some(s => n.includes(s)));
    const names = [...new Set(nameMatches)].slice(0, 6);

    let detectedCategory = category;
    if (category === 'News') {
      if (/falleci|defuncion|muerte/.test(lower)) detectedCategory = 'Death';
      else if (/nacimiento|nació/.test(lower)) detectedCategory = 'Birth';
      else if (/matrimonio|boda/.test(lower)) detectedCategory = 'Marriage';
      else if (/batalla|guerra|revolución/.test(lower)) detectedCategory = 'Historic Event';
      else if (/comercio|empresa|negocio/.test(lower)) detectedCategory = 'Business';
    }

    const summary = fullText.replace(/\s+/g, ' ').trim().substring(0, 200);

    let businessName = '', businessType = '', owner = '', yearFounded = '';
    if (detectedCategory === 'Business') { // Fixed logical reference
      const yearMatch = fullText.match(/\b(1[89]\d{2}|20[0-2]\d)\b/);
      if (yearMatch) yearFounded = yearMatch[0];
      if (names[0]) businessName = names[0];
    }

    let eventName = '';
    if (detectedCategory === 'Historic Event' && lines[1]) eventName = lines[1].substring(0, 60);

    res.json({
      fullText, summary, location, newspaperName, pageNumber, businessName, businessType, owner, yearFounded, eventName,
      names: detectedCategory === 'Business' ? [] : names,
      peopleInvolved: detectedCategory === 'Historic Event' ? names : [],
      eventDate: dates[0] || '',
      publicationDate: dates[1] || '',
      category: detectedCategory,
      countryOfOrigin: 'Honduras',
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
    });
  } catch (error) {
    console.error('❌ Analyze error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── GET single record ─────────────────────────────────────────────────────────
app.get('/api/archive/:id', async (req, res) => {
  try {
    const item = await Archive.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Record not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST save approved record (Secured) ───────────────────────────────────────
app.post('/api/archive', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    let namesArray = req.body.names;
    if (typeof namesArray === 'string') {
      try { namesArray = JSON.parse(namesArray); }
      catch { namesArray = namesArray.split(',').map(n => n.trim()); }
    }
    let peopleArray = req.body.peopleInvolved;
    if (typeof peopleArray === 'string') {
      try { peopleArray = JSON.parse(peopleArray); }
      catch { peopleArray = peopleArray ? peopleArray.split(',').map(n => n.trim()) : []; }
    }

    const imageUrl = req.file ? req.file.path : req.body.imageUrl || null;
    const cloudinaryId = req.file ? req.file.filename : req.body.cloudinaryId || null;

    const item = new Archive({
      ...req.body,
      names: namesArray || [],
      peopleInvolved: peopleArray || [],
      imageUrl,
      cloudinaryId
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT update (Secured) ──────────────────────────────────────────────────────
app.put('/api/archive/:id', authMiddleware, async (req, res) => {
  try {
    const { names, peopleInvolved, ...rest } = req.body;
    let namesArray = names;
    if (typeof namesArray === 'string') {
      try { namesArray = JSON.parse(namesArray); }
      catch { namesArray = namesArray.split(',').map(n => n.trim()); }
    }
    let peopleArray = peopleInvolved;
    if (typeof peopleArray === 'string') {
      try { peopleArray = JSON.parse(peopleArray); }
      catch { peopleArray = peopleArray ? peopleArray.split(',').map(n => n.trim()) : []; }
    }
    const updatedItem = await Archive.findByIdAndUpdate(
      req.params.id,
      { ...rest, names: namesArray, peopleInvolved: peopleArray },
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ error: 'Record not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE (Secured) ──────────────────────────────────────────────────────────
app.delete('/api/archive/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Archive.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.cloudinaryId) await cloudinary.uploader.destroy(item.cloudinaryId);
    await item.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));