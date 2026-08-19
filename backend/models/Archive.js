const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  category: { type: String, default: 'Portrait' }, // Portrait, News, Birth, Marriage, Death, Historic Event, Business

  // Shared fields
  eventDate: String,
  publicationDate: String,
  location: String,
  newspaperName: String,
  pageNumber: String,
  summary: String,
  imageUrl: String,
  cloudinaryId: String,
  familySearchId: String,

  // Person record fields
  names: [String],
  countryOfOrigin: { type: String, default: 'Honduras' },

  // Historic Event fields
  eventName: String,
  peopleInvolved: [String],

  // Business fields
  businessName: String,
  businessType: String,
  owner: String,
  yearFounded: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Archive', archiveSchema);