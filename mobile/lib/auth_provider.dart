import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthProvider with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  User? _user;
  bool _isLoading = true;
  bool _needsProfileCompletion = false;
  Map<String, dynamic>? _userData;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  bool get needsProfileCompletion => _needsProfileCompletion;
  Map<String, dynamic>? get userData => _userData;

  AuthProvider() {
    _initAuth();
  }

  Future<void> _initAuth() async {
    _auth.authStateChanges().listen((User? user) async {
      _user = user;
      _isLoading = false;
      
      if (user != null) {
        await _checkProfileCompletion();
      }
      
      notifyListeners();
    });
  }

  Future<void> _checkProfileCompletion() async {
    if (_user == null) return;

    try {
      final doc = await _firestore.collection('users').doc(_user!.uid).get();
      if (doc.exists) {
        _userData = doc.data();
        _needsProfileCompletion = !_userData!.containsKey('nama') || 
                                  !_userData!.containsKey('prodi') || 
                                  !_userData!.containsKey('angkatan');
      } else {
        _needsProfileCompletion = true;
      }
    } catch (e) {
      _needsProfileCompletion = true;
    }
    notifyListeners();
  }

  Future<void> loginWithNIM(String nim, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      // Create email from NIM
      final email = '$nim@student.ac.id';
      
      await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      _user = _auth.currentUser;
      await _checkProfileCompletion();
    } on FirebaseAuthException catch (e) {
      throw e.message ?? 'Login gagal';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> completeProfile({
    required String nama,
    required String prodi,
    required String angkatan,
  }) async {
    if (_user == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      await _firestore.collection('users').doc(_user!.uid).set({
        'nim': _user!.email?.split('@')[0],
        'nama': nama,
        'prodi': prodi,
        'angkatan': angkatan,
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });

      _userData = {
        'nim': _user!.email?.split('@')[0],
        'nama': nama,
        'prodi': prodi,
        'angkatan': angkatan,
      };
      _needsProfileCompletion = false;
    } catch (e) {
      throw 'Gagal menyimpan profil';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _auth.signOut();
    _user = null;
    _userData = null;
    _needsProfileCompletion = false;
    notifyListeners();
  }
}
