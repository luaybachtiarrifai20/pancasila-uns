# Modul Digital Interaktif Pancasila

Aplikasi pembelajaran interaktif untuk Mata Kuliah Umum Pancasila dengan tujuan meningkatkan kemandirian belajar mahasiswa.

## Tech Stack

- **Mobile**: Flutter
- **Web**: React
- **Database**: Firebase (Firestore & Authentication)

## Project Structure

```
app-pancasila/
├── mobile/                 # Flutter mobile app
│   ├── lib/
│   │   ├── main.dart
│   │   ├── auth_provider.dart
│   │   └── screens/
│   │       ├── login_screen.dart
│   │       ├── profile_completion_screen.dart
│   │       └── home_screen.dart
│   └── pubspec.yaml
├── website/               # React web app
│   ├── src/
│   │   ├── firebase.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── ProfileCompletion.js
│   │   │   └── Home.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── firebase-config.json   # Firebase configuration template
```

## Features

- Login menggunakan NIM dan password
- Profil completion pada login pertama (nama, prodi, angkatan)
- 5 modul pembelajaran Pancasila
- Dashboard dengan progress tracking
- Responsive design untuk mobile dan web

## Firebase Setup

1. Buat project baru di [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → **Email/Password**
3. Enable **Firestore Database**
4. Copy Firebase config dan update di:
   - `firebase-config.json`
   - `website/src/firebase.js`
5. Untuk Android:
   - Download `google-services.json` dari Firebase Console
   - Place di `mobile/android/app/`
6. Untuk iOS:
   - Download `GoogleService-Info.plist` dari Firebase Console
   - Place di `mobile/ios/Runner/`

## Mobile App Setup (Flutter)

### Prerequisites
- Flutter SDK (>=3.0.0)
- Android Studio / Xcode
- Firebase project configured

### Installation

```bash
cd mobile
flutter pub get
```

### Running the App

```bash
# Android
flutter run

# iOS
flutter run -d ios

# Web
flutter run -d chrome
```

### Build

```bash
# APK
flutter build apk

# App Bundle
flutter build appbundle

# iOS
flutter build ios
```

## Web App Setup (React)

### Prerequisites
- Node.js (>=14)
- npm or yarn
- Firebase project configured

### Installation

```bash
cd website
npm install
```

### Running the App

```bash
npm start
```

App akan berjalan di `http://localhost:3000`

### Build

```bash
npm run build
```

Build output akan ada di folder `build/`

## User Creation

Untuk membuat user baru, Anda perlu membuat user di Firebase Authentication:

1. Buka Firebase Console → Authentication
2. Klik "Add user"
3. Email format: `{NIM}@student.ac.id`
4. Set password
5. User akan diminta melengkapi profil (nama, prodi, angkatan) pada login pertama

## Firestore Database Schema

### Collection: `users`
```
{
  nim: string,
  nama: string,
  prodi: string,
  angkatan: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `progress` (untuk tracking progress belajar)
```
{
  userId: string,
  moduleId: string,
  completed: boolean,
  score: number,
  completedAt: timestamp
}
```

## Modules

Aplikasi mencakup 5 modul pembelajaran:
1. Pancasila sebagai Dasar Negara
2. Nilai-Nilai Pancasila
3. Pancasila dalam Kehidupan Berbangsa
4. Pancasila dalam Era Global
5. Implementasi Pancasila

## Development Notes

- Login menggunakan NIM yang dikonversi menjadi email format `{NIM}@student.ac.id`
- Profile completion wajib dilakukan pada login pertama
- Data user disimpan di Firestore collection `users`
- Aplikasi mobile dan web menggunakan Firebase yang sama

## Troubleshooting

### Flutter
- Jika error Firebase, pastikan `google-services.json` (Android) atau `GoogleService-Info.plist` (iOS) sudah ditambahkan
- Run `flutter clean` jika ada dependency issues

### React
- Pastikan Firebase config di `firebase.js` sudah benar
- Clear cache: `npm start -- --reset-cache`

## License

This project is for educational purposes.
