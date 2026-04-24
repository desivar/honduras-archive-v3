const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Resend } = require('resend');

const JWT_SECRET = process.env.JWT_SECRET || 'honduras_archive-v3_dev_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://honduras-archive-v3-1.onrender.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Email helper ──────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: 'Recuerdos de Honduras <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email error:', err.message);
    // Don't throw — email failure should not break registration
  }
};

// ── Auth middleware ───────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ── SIGNUP ────────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, whatsapp, role: requestedRole } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken.' });
    }

    const userCount = await User.countDocuments({});
    let assignedRole, assignedStatus;

    if (userCount === 0) {
      assignedRole = 'admin';
      assignedStatus = 'approved';
    } else if (requestedRole === 'genealogist') {
      assignedRole = 'genealogist';
      assignedStatus = 'pending';
    } else {
      assignedRole = 'visitor';
      assignedStatus = 'approved';
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const verificationToken = jwt.sign(
      { email, username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: assignedRole,
      status: assignedStatus,
      whatsapp,
      emailVerified: assignedRole === 'admin', // admin auto-verified
      verificationToken: assignedRole === 'admin' ? null : verificationToken,
    });

    await user.save();

    // ── Send verification email to new user ──
    if (assignedRole !== 'admin') {
      const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: email,
        subject: 'Verifica tu correo — Recuerdos de Honduras',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #F8FBFF; border: 1px solid #D4AC0D;">
            <h2 style="color: #0F3460; border-bottom: 2px solid #D4AC0D; padding-bottom: 12px;">
              Recuerdos de Honduras
            </h2>
            <p style="color: #2c3e50; font-size: 1rem; line-height: 1.6;">
              Hola <strong>${username}</strong>, gracias por registrarte.
            </p>
            <p style="color: #2c3e50; font-size: 1rem; line-height: 1.6;">
              Please verify your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}" style="background: #0F3460; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 1rem;">
                ✅ Verify Email / Verificar Correo
              </a>
            </div>
            <p style="color: #888; font-size: 0.85rem;">
              This link expires in 24 hours. / Este enlace expira en 24 horas.
            </p>
            ${assignedStatus === 'pending' ? `
            <p style="color: #2c3e50; font-size: 0.95rem; background: #EAF0F7; padding: 12px; border-left: 4px solid #D4AC0D;">
              After verifying your email, your genealogist account will be reviewed by our admin team.
              You will receive another email once your account is approved.
              <br><br>
              Después de verificar tu correo, tu cuenta de genealogista será revisada por nuestro equipo.
              Recibirás otro correo cuando tu cuenta sea aprobada.
            </p>` : ''}
            <hr style="border-color: #D4AC0D; margin: 24px 0;">
            <p style="color: #888; font-size: 0.8rem; text-align: center;">
              Recuerdos de Honduras — Archivo Histórico
            </p>
          </div>
        `,
      });
    }

    // ── Notify admin of new genealogist registration ──
    if (assignedStatus === 'pending' && ADMIN_EMAIL) {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: '⏳ Nueva solicitud de genealogista — Recuerdos de Honduras',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #F8FBFF; border: 1px solid #D4AC0D;">
            <h2 style="color: #0F3460; border-bottom: 2px solid #D4AC0D; padding-bottom: 12px;">
              Nueva Solicitud de Genealogista
            </h2>
            <p style="color: #2c3e50;">A new genealogist has registered and is waiting for your approval:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #EAF0F7;">
                <td style="padding: 10px; font-weight: bold; color: #0F3460;">Username</td>
                <td style="padding: 10px; color: #2c3e50;">${username}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #0F3460;">Email</td>
                <td style="padding: 10px; color: #2c3e50;">${email}</td>
              </tr>
              ${whatsapp ? `<tr style="background: #EAF0F7;">
                <td style="padding: 10px; font-weight: bold; color: #0F3460;">WhatsApp</td>
                <td style="padding: 10px; color: #2c3e50;">${whatsapp}</td>
              </tr>` : ''}
              <tr ${whatsapp ? '' : 'style="background: #EAF0F7;"'}>
                <td style="padding: 10px; font-weight: bold; color: #0F3460;">Registered</td>
                <td style="padding: 10px; color: #2c3e50;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${FRONTEND_URL}/admin" style="background: #0F3460; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                ⚙️ Go to Admin Panel
              </a>
            </div>
            <hr style="border-color: #D4AC0D; margin: 24px 0;">
            <p style="color: #888; font-size: 0.8rem; text-align: center;">
              Recuerdos de Honduras — Archivo Histórico
            </p>
          </div>
        `,
      });
    }

    const message = assignedStatus === 'pending'
      ? 'Registration received! Please check your email to verify your account. Your genealogist account will then be reviewed by our admin team.'
      : assignedRole === 'admin'
      ? 'Welcome! Admin account created.'
      : 'Welcome! Please check your email to verify your account.';

    res.status(201).json({ success: true, message, pending: assignedStatus === 'pending' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── VERIFY EMAIL ──────────────────────────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'No token provided.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.emailVerified) return res.json({ success: true, message: 'Email already verified.' });

    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();

    // If visitor — auto approved after verification
    // If genealogist — still pending admin approval, notify admin again
    if (user.role === 'genealogist' && user.status === 'pending' && ADMIN_EMAIL) {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: '✅ Genealogist verified email — awaiting your approval',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #F8FBFF; border: 1px solid #4CAF50;">
            <h2 style="color: #0F3460; border-bottom: 2px solid #4CAF50; padding-bottom: 12px;">
              ✅ Email Verified — Pending Your Approval
            </h2>
            <p style="color: #2c3e50;"><strong>${user.username}</strong> (${user.email}) has verified their email and is waiting for your approval.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${FRONTEND_URL}/admin" style="background: #2E7D32; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                ✅ Approve or Reject
              </a>
            </div>
          </div>
        `,
      });
    }

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ success: false, message: 'User not found.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid password.' });

    // Check email verification (skip for admin)
    if (!user.emailVerified && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox.',
        needsVerification: true,
      });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ success: false, message: 'Your account registration was not approved.' });
    }

    const sessionIndex = user.sessions.push({ loginAt: new Date() }) - 1;
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in!',
      token,
      sessionIndex,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── APPROVE / REJECT genealogist (admin) ─────────────────────────────────────
router.put('/users/approve/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    // ── Notify user of approval/rejection ──
    if (user.email) {
      const approved = status === 'approved';
      await sendEmail({
        to: user.email,
        subject: approved
          ? '✅ Your account has been approved — Recuerdos de Honduras'
          : '❌ Your account was not approved — Recuerdos de Honduras',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #F8FBFF; border: 1px solid ${approved ? '#4CAF50' : '#a94442'};">
            <h2 style="color: #0F3460; border-bottom: 2px solid ${approved ? '#4CAF50' : '#a94442'}; padding-bottom: 12px;">
              ${approved ? '✅ Account Approved!' : '❌ Account Not Approved'}
            </h2>
            <p style="color: #2c3e50; font-size: 1rem; line-height: 1.6;">
              Hola <strong>${user.username}</strong>,
            </p>
            ${approved ? `
            <p style="color: #2c3e50; line-height: 1.6;">
              Your genealogist account for <strong>Recuerdos de Honduras</strong> has been approved!
              You can now log in and access the archive.
              <br><br>
              Tu cuenta de genealogista ha sido aprobada. Ya puedes iniciar sesión.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${FRONTEND_URL}/login" style="background: #2E7D32; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                🔐 Log In Now / Iniciar Sesión
              </a>
            </div>
            ` : `
            <p style="color: #2c3e50; line-height: 1.6;">
              Unfortunately your genealogist account request was not approved at this time.
              If you believe this is an error, please contact us.
              <br><br>
              Lamentablemente tu solicitud de cuenta de genealogista no fue aprobada.
            </p>
            `}
            <hr style="border-color: #D4AC0D; margin: 24px 0;">
            <p style="color: #888; font-size: 0.8rem; text-align: center;">
              Recuerdos de Honduras — Archivo Histórico
            </p>
          </div>
        `,
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── LOGOUT ────────────────────────────────────────────────────────────────────
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { sessionIndex } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (sessionIndex !== undefined && user.sessions[sessionIndex]) {
      const loginAt = new Date(user.sessions[sessionIndex].loginAt);
      const logoutAt = new Date();
      const duration = Math.round((logoutAt - loginAt) / 60000);
      user.sessions[sessionIndex].logoutAt = logoutAt;
      user.sessions[sessionIndex].duration = duration;
      await user.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET all users (admin) ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// ── GET pending genealogists ──────────────────────────────────────────────────
router.get('/users/pending', async (req, res) => {
  try {
    const pending = await User.find({ role: 'genealogist', status: 'pending' }).select('-password');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CHANGE ROLE (admin) ───────────────────────────────────────────────────────
router.put('/users/role/:id', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating role' });
  }
});

// ── GET genealogist dashboard ─────────────────────────────────────────────────
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('bookmarks', 'names eventName category eventDate location imageUrl')
      .populate('notes.recordId', 'names eventName category');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalMinutes = user.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      username: user.username,
      role: user.role,
      memberSince: user.createdAt,
      totalSessions: user.sessions.length,
      totalMinutesSpent: totalMinutes,
      recentSearches: user.searchHistory.slice(-20).reverse(),
      bookmarks: user.bookmarks,
      notes: user.notes,
      sessions: user.sessions.slice(-10).reverse(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── LOG search history ────────────────────────────────────────────────────────
router.post('/activity/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) return res.json({ success: true });
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        searchHistory: {
          $each: [{ query: query.trim(), searchedAt: new Date() }],
          $slice: -100,
        },
      },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── TOGGLE bookmark ───────────────────────────────────────────────────────────
router.post('/activity/bookmark/:recordId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const recordId = req.params.recordId;
    const isBookmarked = user.bookmarks.some(b => b.toString() === recordId);
    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(b => b.toString() !== recordId);
    } else {
      user.bookmarks.push(recordId);
    }
    await user.save();
    res.json({ success: true, bookmarked: !isBookmarked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── SAVE note ────────────────────────────────────────────────────────────────
router.post('/activity/note/:recordId', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const recordId = req.params.recordId;
    const user = await User.findById(req.user.id);
    const existingNote = user.notes.find(n => n.recordId.toString() === recordId);
    if (existingNote) {
      existingNote.text = text;
      existingNote.updatedAt = new Date();
    } else {
      user.notes.push({ recordId, text });
    }
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET bookmarks ─────────────────────────────────────────────────────────────
router.get('/activity/bookmarks', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarks', 'names eventName category eventDate location imageUrl');
    res.json(user.bookmarks || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;