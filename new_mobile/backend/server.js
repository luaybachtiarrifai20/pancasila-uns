require('dotenv').config();

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

app.use(cors());
app.use(express.json());

// ======================
// Firebase Admin Config
// ======================

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// ======================
// Routes
// ======================

app.get('/', (req, res) => {
  res.send('🚀 Firebase Backend Running');
});

// ======================
// Create User
// ======================

app.post('/create-user', async (req, res) => {
  const { name, nim, classId } = req.body;

  if (!name || !nim || !classId) {
    return res.status(400).send({
      message: 'Name, NIM, dan classId wajib diisi'
    });
  }

  const formattedNIM = nim.toUpperCase().trim();
  const email = `${formattedNIM.toLowerCase()}@pancasila.id`;
  const password = 'pancasila123';

  try {
    // Check duplicate NIM
    const existingUser = await db
      .collection('users')
      .where('nim', '==', formattedNIM)
      .get();

    if (!existingUser.empty) {
      return res.status(400).send({
        message: `NIM ${formattedNIM} sudah terdaftar`
      });
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Save Firestore
    const userData = {
      uid: userRecord.uid,
      email,
      name,
      nim: formattedNIM,
      classId,
      role: 'mahasiswa',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(email).set(userData);

    res.status(201).send({
      message: '✅ User berhasil dibuat',
      user: userData
    });

  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: '❌ Error creating user',
      error: error.message
    });
  }
});

// ======================
// Delete User
// ======================

app.delete('/delete-user', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({
      message: 'Email wajib diisi'
    });
  }

  try {
    const userRecord = await auth.getUserByEmail(email);

    await auth.deleteUser(userRecord.uid);

    await db.collection('users').doc(email).delete();

    res.status(200).send({
      message: `✅ User ${email} berhasil dihapus`
    });

  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: '❌ Error deleting user',
      error: error.message
    });
  }
});

// ======================
// Start Server
// ======================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});