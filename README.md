# 🇭🇳 Recuerdos de Honduras — Newspaper Archive v3

> A free, open-source digital archive preserving the historical memory of Honduras through newspaper clippings, portraits, vital records, and historic documents.

![Project Banner](docs/hero-banner.png)

---

## 🌐 Live Demo

🔗 **[https://honduras-archive-v3-1.onrender.com](https://honduras-archive-v3-1.onrender.com)**

📽️ **Video Demo:** *(coming soon)*

---

## 📖 About the Project

**Recuerdos de Honduras** is a volunteer-driven digital archive built to preserve and make accessible thousands of historical newspaper images from Honduras. The project is built entirely with free tools and hosted on free services — because history should be accessible to everyone.

The archive contains portraits, birth/marriage/death notices, business records, historic events, and general news clippings from Honduran and Central American newspapers and magazines spanning over a century.

---

## ✨ Features — Version 3

### 🖼️ Archive & Collections
- **7 collections** — Portrait, News & Clippings, Historic Events, Businesses, Births, Marriages, Deaths
- **Full-text search** across all records and collections
- **Surname index A–Z** for genealogical research
- **Record detail pages** with citation generator
- **Share records** via WhatsApp, Facebook, or copy link
- **Download images** directly from record pages
- **"Registro del Día"** — a randomly featured record on the homepage that changes daily

### 🔍 Smart OCR Scan & Auto-fill
- Upload a newspaper image and the system **automatically extracts text** using Tesseract OCR
- **Smart parser** detects and auto-fills: names, dates, location, newspaper name, page number, category, and summary
- **Category auto-detection** — system suggests the right collection based on keywords
- **Human review + approval** flow — nothing is saved until the admin approves
- Supports Spanish and English newspaper text

### 👤 User System & Authentication
- **3 user roles** — Admin, Genealogist, Visitor
- **Email verification** on registration via Resend
- **Admin approval flow** for genealogist accounts
- **Email notifications** at every step:
  - New user receives verification email
  - Admin receives notification of new genealogist registration
  - Admin receives notification when email is verified
  - User receives approval or rejection email
- **Genealogist dashboard** — bookmarks, notes, search history, session tracking
- **JWT authentication** with 7-day token expiry

### 🌍 Internationalization
- **Bilingual interface** — English / Spanish (i18n)
- Language toggle in the sidebar
- Bilingual introduction section on homepage

### 🎨 Design
- **Honduras National Pride palette** — navy blue, white, gold, nature green
- Responsive sidebar with surname index
- Animated homepage with rotating historical quotes
- Collection cards with hover effects and live record counts
- Support button (PayPal integration)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Image Storage | Cloudinary |
| OCR | Tesseract.js (free) |
| Email | Resend (free tier) |
| Hosting | Render.com (free tier) |
| Auth | JWT |
| i18n | react-i18next |

**Total hosting cost: $0/month** 🆓

---

## 📸 Screenshots

### Homepage — Registro del Día
![Homepage](docs/screenshot-home.png)

### Upload & Smart Scan
![Upload](docs/screenshot-upload.png)

### Record Detail
![Record Detail](docs/screenshot-record.png)

### Admin Panel
![Admin Panel](docs/screenshot-admin.png)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Cloudinary account (free)
- Resend account (free)
- Render account (free)

## 📁 Project Structure

```
honduras-archive-v3/
├── backend/
│   ├── server.js              # Main server — archive routes + OCR scan
│   ├── routes/
│   │   └── authRoutes.js      # Auth, email verification, user management
│   └── models/
│       └── User.js            # User schema with sessions, bookmarks, notes
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── SideBar.jsx         # Navigation + live record count
│       │   ├── TodayInHistory.jsx  # Daily featured record widget
│       │   ├── ResultCard.jsx      # Search result card
│       │   └── LanguageToggle.jsx  # EN/ES switcher
│       └── pages/
│           ├── SearchPage.jsx      # Homepage — hero + intro + collections + search
│           ├── UploadPage.jsx      # Admin upload with OCR scan + auto-fill
│           ├── RecordDetail.jsx    # Full record view with sharing
│           ├── EditPage.jsx        # Admin record editor
│           ├── AdminPanel.jsx      # User management + approvals
│           ├── LoginPage.jsx       # Authentication
│           ├── Register.jsx        # Registration with role selection
│           ├── GenealogistDashboard.jsx
│           ├── CollectionView.jsx
│           ├── HistoricEventsPage.jsx
│           └── BusinessesPage.jsx
└── README.md
```

---

## 🔄 Upload Workflow

```
1. Admin selects category
       ↓
2. Admin uploads newspaper image
       ↓
3. Tesseract OCR extracts text
       ↓
4. Smart parser auto-fills form fields
       ↓
5. Admin reviews + corrects any OCR errors
       ↓
6. Admin approves record
       ↓
7. Record saved to MongoDB + image stored in Cloudinary
```

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| **Visitor** | Browse, search, view records, share, download images |
| **Genealogist** | All visitor permissions + bookmarks, notes, search history, dashboard |
| **Admin** | All permissions + upload, edit, delete records, manage users |

---

## 📧 Email Flow

```
User registers as genealogist
        ↓
User receives verification email
        ↓
Admin receives notification
        ↓
User verifies email
        ↓
Admin receives "ready to approve" notification
        ↓
Admin approves or rejects in Admin Panel
        ↓
User receives approval/rejection email
```

---

## ❤️ Support the Project

This archive is built and maintained by a volunteer with no budget. If this project helps your genealogical research or you want to support the preservation of Honduran history:

**[💙 Support via PayPal](https://paypal.me/yourusername)**

Every contribution helps cover future hosting costs as the archive grows.

---

## 🤝 Contributing

Contributions are welcome! If you know of Honduran newspapers, magazines, or historical documents that should be included, please open an issue or contact us.

---

## 📜 License

This project is open source. Historical documents and images belong to their respective sources and are shared for educational and genealogical research purposes.

---

## 👩‍💻 Author

**Desire Vargas** — Graphic Designer & Developer  
🇭🇳 La Paz, La Paz, Honduras  
GitHub: [@desivar](https://github.com/desivar)

---

*"El pueblo que no conoce su historia está condenado a repetirla." — José Cecilio del Valle, 1821*
