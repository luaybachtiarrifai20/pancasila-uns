import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/dosen_dashboard_screen.dart';
import 'screens/admin_dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  FirebaseOptions options;
  if (kIsWeb) {
    options = const FirebaseOptions(
      apiKey: "AIzaSyA2qfKiuewAmq9AOCNLaSj9BTxIMuyE0uE",
      authDomain: "pancasila-uns.firebaseapp.com",
      projectId: "pancasila-uns",
      storageBucket: "pancasila-uns.firebasestorage.app",
      messagingSenderId: "543989558747",
      appId: "1:543989558747:web:d7eafc994530b6e5b94bfe",
    );
  } else if (Platform.isAndroid) {
    options = const FirebaseOptions(
      apiKey: "AIzaSyA-hH0dBg1ka8J1EhUlyuNl1ha30z1GwtU",
      projectId: "pancasila-uns",
      storageBucket: "pancasila-uns.firebasestorage.app",
      messagingSenderId: "543989558747",
      appId: "1:543989558747:android:f6f4ff926ea2debbb94bfe",
    );
  } else if (Platform.isIOS) {
    options = const FirebaseOptions(
      apiKey: "AIzaSyA-hH0dBg1ka8J1EhUlyuNl1ha30z1GwtU",
      projectId: "pancasila-uns",
      storageBucket: "pancasila-uns.firebasestorage.app",
      messagingSenderId: "543989558747",
      appId: "1:543989558747:ios:c503028d7eafc994530b6e", // generic iOS appId
      iosBundleId: "com.uns.pancasila",
    );
  } else {
    options = const FirebaseOptions(
      apiKey: "AIzaSyA-hH0dBg1ka8J1EhUlyuNl1ha30z1GwtU",
      projectId: "pancasila-uns",
      storageBucket: "pancasila-uns.firebasestorage.app",
      messagingSenderId: "543989558747",
      appId: "1:543989558747:ios:c503028d7eafc994530b6e",
    );
  }

  try {
    await Firebase.initializeApp(options: options);
  } catch (e) {
    debugPrint("Firebase initialization failed/skipped: $e");
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Modul MKU Pancasila',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.red),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/dosen_dashboard': (context) => const DosenDashboardScreen(),
        '/admin_dashboard': (context) => const AdminDashboardScreen(),
      },
    );
  }
}
