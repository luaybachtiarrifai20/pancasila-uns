import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await checkProfileCompletion(user);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkProfileCompletion = async (user) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setNeedsProfileCompletion(
          !data.nama || !data.prodi || !data.angkatan
        );
      } else {
        setNeedsProfileCompletion(true);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setNeedsProfileCompletion(true);
    }
  };

  const login = async (nim, password) => {
    const email = `${nim}@student.ac.id`;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const completeProfile = async (nama, prodi, angkatan) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'users', user.uid), {
        nim: user.email.split('@')[0],
        nama,
        prodi,
        angkatan,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setUserData({
        nim: user.email.split('@')[0],
        nama,
        prodi,
        angkatan,
      });
      setNeedsProfileCompletion(false);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setNeedsProfileCompletion(false);
  };

  const value = {
    user,
    userData,
    loading,
    needsProfileCompletion,
    login,
    completeProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
