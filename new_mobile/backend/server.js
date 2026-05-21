const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Graceful check for Service Account Key
const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('\n❌ ERROR: File "serviceAccountKey.json" TIDAK ditemukan di folder backend!');
  console.error('========================================================================');
  console.error('👉 CARA MENDAPATKANNYA:');
  console.error('1. Buka Firebase Console (https://console.firebase.google.com).');
  console.error('2. Masuk ke Project Settings (klik ikon Gerigi di sebelah kiri atas).');
  console.error('3. Pilih tab "Service Accounts".');
  console.error('4. Klik tombol biru "Generate New Private Key" di bagian bawah.');
  console.error('5. File .json akan terunduh otomatis ke komputer Anda.');
  console.error('6. Ganti nama (rename) file tersebut menjadi: serviceAccountKey.json');
  console.error('7. Pindahkan/copy file tersebut ke dalam folder backend ini:');
  console.error(`   ${__dirname}`);
  console.error('========================================================================\n');
  process.exit(1);
}

const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to create user in both Auth and Firestore
app.post('/create-user', async (req, res) => {
  const { name, nim, classId } = req.body;

  if (!name || !nim || !classId) {
    return res.status(400).send({ message: "Name, NIM, and classId are required" });
  }

  const formattedNIM = nim.toUpperCase().trim();
  const email = `${formattedNIM.toLowerCase()}@pancasila.id`;
  const password = 'pancasila123';

  try {
    // 1. Check if NIM already exists in Firestore
    const userDoc = await db.collection('users').where('nim', '==', formattedNIM).get();
    if (!userDoc.empty) {
      return res.status(400).send({ message: `NIM ${formattedNIM} sudah terdaftar!` });
    }

    // 2. Create in Firebase Authentication
    await auth.createUser({
      email: email,
      password: password,
      displayName: name
    });

    // 3. Add profile to Firestore
    const studentData = {
      id: email,
      name: name,
      nim: formattedNIM,
      role: 'mahasiswa',
      classId: classId
    };
    await db.collection('users').doc(email).set(studentData);

    res.status(201).send({ message: "Successfully created user", user: studentData });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ message: "Error creating user", error: error.message });
  }
});

// Endpoint to delete user from both Auth and Firestore
app.delete('/delete-user', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    // 1. Get User by Email to find their UID
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;

    // 2. Delete from Firebase Authentication
    await auth.deleteUser(uid);

    // 3. Delete from Firestore
    await db.collection('users').doc(email).delete();

    res.status(200).send({ message: `Successfully deleted user ${email} from Auth and Firestore` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ message: "Error deleting user", error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
