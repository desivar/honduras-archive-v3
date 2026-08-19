require('dotenv').config();
const mongoose = require('mongoose');

// ── Same Archive schema as server.js ──
const archiveSchema = new mongoose.Schema({
  title: String, names: [String], summary: String, fullText: String,
  category: String, location: String, eventDate: String, publicationDate: String,
  newspaperName: String, countryOfOrigin: String, pageNumber: String,
  imageUrl: String, cloudinaryId: String, eventName: String, peopleInvolved: [String],
  businessName: String, businessType: String, owner: String, yearFounded: String,
  createdAt: { type: Date, default: Date.now }
});
const Archive = mongoose.model('Archive', archiveSchema);

// ── Same normalizeDate function as server.js ──
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const fullYear = (y) => y.length === 2 ? (parseInt(y, 10) > 30 ? '18' + y : '19' + y) : y;

const normalizeDate = (raw) => {
  if (!raw) return raw;

  let m = raw.match(/(\d{1,2})\s*(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s*(?:de\s+)?(\d{2,4})/i);
  if (m) return `${parseInt(m[1], 10)} ${capitalize(m[2])} ${fullYear(m[3])}`;

  m = raw.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{1,2}),?\s*(\d{2,4})/i);
  if (m) return `${parseInt(m[2], 10)} ${capitalize(m[1])} ${fullYear(m[3])}`;

  m = raw.match(/(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{2,4})/i);
  if (m) return `${parseInt(m[1], 10)} ${capitalize(m[2])} ${fullYear(m[3])}`;

  m = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const idx = parseInt(m[2], 10) - 1;
    const monthName = MONTHS_ES[idx] ? capitalize(MONTHS_ES[idx]) : m[2];
    return `${parseInt(m[1], 10)} ${monthName} ${fullYear(m[3])}`;
  }

  return raw; // leave unrecognized formats untouched
};

// ── Run the migration ──
const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected to MongoDB');

  const records = await Archive.find({});
  console.log(`Found ${records.length} total records`);

  let updatedCount = 0;

  for (const record of records) {
    const newEventDate = normalizeDate(record.eventDate);
    const newPublicationDate = normalizeDate(record.publicationDate);

    const changed =
      newEventDate !== record.eventDate ||
      newPublicationDate !== record.publicationDate;

    if (changed) {
      console.log(`Updating ${record._id}:`);
      if (newEventDate !== record.eventDate) {
        console.log(`  eventDate: "${record.eventDate}" → "${newEventDate}"`);
      }
      if (newPublicationDate !== record.publicationDate) {
        console.log(`  publicationDate: "${record.publicationDate}" → "${newPublicationDate}"`);
      }
      record.eventDate = newEventDate;
      record.publicationDate = newPublicationDate;
      await record.save();
      updatedCount++;
    }
  }

  console.log(`\n✅ Migration complete. ${updatedCount} of ${records.length} records updated.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});