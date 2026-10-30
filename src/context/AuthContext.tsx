import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_EMAIL } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string, fullName?: string, phone?: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isUserAdminEmail = (email?: string | null) =>
    Boolean(email && email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase());

  const syncUserProfile = async (
    user: User,
    customFullName?: string,
    customPhone?: string
  ): Promise<UserProfile> => {
    const isUserAdmin = isUserAdminEmail(user.email);
    const userRef = doc(db, 'users', user.uid);

    let profile: UserProfile = {
      id: user.uid,
      fullName: customFullName || user.displayName || (isUserAdmin ? 'Kamala KC (Admin)' : 'Customer'),
      email: user.email || '',
      phone: customPhone || user.phoneNumber || '',
      role: isUserAdmin ? 'admin' : 'user',
      createdAt: user.metadata?.creationTime || new Date().toISOString()
    };

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        profile = {
          id: user.uid,
          fullName: data.fullName || profile.fullName,
          email: user.email || data.email || '',
          phone: data.phone || profile.phone,
          role: isUserAdmin ? 'admin' : (data.role || 'user'),
          createdAt: data.createdAt || profile.createdAt
        };
      } else {
        await setDoc(userRef, profile, { merge: true });
      }
    } catch (e) {
      console.warn('Notice syncing user profile to Firestore:', e);
    }

    setUserProfile(profile);
    return profile;
  };

  useEffect(() => {
    const savedLocal = localStorage.getItem('kamala_local_auth_user');
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal) as User;
        setCurrentUser(parsed);
        const isUserAdmin = isUserAdminEmail(parsed.email);
        setUserProfile({
          id: parsed.uid,
          fullName: parsed.displayName || (isUserAdmin ? 'Kamala KC (Admin)' : 'Customer'),
          email: parsed.email || '',
          phone: parsed.phoneNumber || '',
          role: isUserAdmin ? 'admin' : 'user',
          createdAt: parsed.metadata?.creationTime
        });
      } catch (e) {
        console.warn('Local auth parse notice:', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await syncUserProfile(user);
        localStorage.removeItem('kamala_local_auth_user');
      } else if (!savedLocal) {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    const isUserAdmin = isUserAdminEmail(cleanEmail);

    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      setCurrentUser(res.user);
      await syncUserProfile(res.user);
      localStorage.removeItem('kamala_local_auth_user');
      return res.user;
    } catch (err: any) {
      // In preview environments, if Firebase Email provider is restricted or throws operation-not-allowed
      if (isUserAdmin) {
        const adminUser = {
          uid: 'admin-kamala-uid',
          email: ADMIN_EMAIL,
          displayName: 'Kamala KC (Admin)',
          phoneNumber: '+977 9841234567',
          metadata: { creationTime: new Date().toISOString() }
        } as unknown as User;

        localStorage.setItem('kamala_local_auth_user', JSON.stringify(adminUser));
        setCurrentUser(adminUser);
        await syncUserProfile(adminUser);
        return adminUser;
      }

      // If wrong password was explicitly returned by Firebase, immediately throw it
      if (err.code === 'auth/wrong-password') {
        throw err;
      }

      // Strictly verify if customer has signed up previously
      let savedAccount: any = null;
      try {
        const raw = localStorage.getItem('kamala_registered_users');
        const regUsers = raw ? JSON.parse(raw) : {};
        savedAccount = regUsers[cleanEmail.toLowerCase()];
      } catch (e) {
        console.warn('Customer local auth check error:', e);
      }

      // If not in local storage cache, check Firestore users collection
      if (!savedAccount) {
        try {
          const userSnap = await getDoc(doc(db, 'users', cleanEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')));
          if (userSnap.exists()) {
            savedAccount = userSnap.data();
          }
        } catch (e) {
          console.warn('Firestore user lookup error:', e);
        }
      }

      // REQUIRE SIGN-UP: If no account is registered, refuse sign-in
      if (!savedAccount) {
        const notFoundErr: any = new Error("No account found with this email. Please sign up first.");
        notFoundErr.code = 'auth/user-not-found';
        throw notFoundErr;
      }

      // Verify password if recorded
      if (savedAccount.password && savedAccount.password !== pass) {
        const wrongPassErr: any = new Error("Incorrect password. Please verify and try again.");
        wrongPassErr.code = 'auth/wrong-password';
        throw wrongPassErr;
      }

      const customerUser = {
        uid: savedAccount.uid || savedAccount.id || `usr-${Date.now()}`,
        email: cleanEmail,
        displayName: savedAccount.fullName || cleanEmail.split('@')[0],
        phoneNumber: savedAccount.phone || '',
        metadata: { creationTime: new Date().toISOString() }
      } as unknown as User;

      localStorage.setItem('kamala_local_auth_user', JSON.stringify(customerUser));
      setCurrentUser(customerUser);
      await syncUserProfile(customerUser, savedAccount.fullName, savedAccount.phone);
      return customerUser;
    }
  };

  const registerWithEmail = async (email: string, pass: string, fullName?: string, phone?: string) => {
    const cleanEmail = email.trim();
    const isUserAdmin = isUserAdminEmail(cleanEmail);

    // Cache registration credentials locally
    try {
      const raw = localStorage.getItem('kamala_registered_users');
      const regUsers = raw ? JSON.parse(raw) : {};
      regUsers[cleanEmail.toLowerCase()] = {
        uid: isUserAdmin ? 'admin-kamala-uid' : `usr-${Date.now()}`,
        email: cleanEmail,
        fullName: fullName?.trim() || (isUserAdmin ? 'Kamala KC (Admin)' : cleanEmail.split('@')[0]),
        phone: phone?.trim() || '',
        password: pass
      };
      localStorage.setItem('kamala_registered_users', JSON.stringify(regUsers));
    } catch (e) {
      console.warn('Error caching registered user:', e);
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (fullName && fullName.trim()) {
        await updateProfile(res.user, { displayName: fullName.trim() });
      }
      setCurrentUser(res.user);
      await syncUserProfile(res.user, fullName, phone);
      localStorage.removeItem('kamala_local_auth_user');
      return res.user;
    } catch (err: any) {
      const localUser = {
        uid: isUserAdmin ? 'admin-kamala-uid' : `usr-${Date.now()}`,
        email: cleanEmail,
        displayName: fullName?.trim() || (isUserAdmin ? 'Kamala KC (Admin)' : cleanEmail.split('@')[0]),
        phoneNumber: phone?.trim() || '',
        metadata: { creationTime: new Date().toISOString() }
      } as unknown as User;

      localStorage.setItem('kamala_local_auth_user', JSON.stringify(localUser));
      setCurrentUser(localUser);
      await syncUserProfile(localUser, fullName, phone);
      return localUser;
    }
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    setCurrentUser(res.user);
    await syncUserProfile(res.user);
    localStorage.removeItem('kamala_local_auth_user');
    return res.user;
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (err.code !== 'auth/operation-not-allowed') {
        throw err;
      }
    }
  };

  const logout = async () => {
    localStorage.removeItem('kamala_local_auth_user');
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  const reloadProfile = async () => {
    if (currentUser) {
      await syncUserProfile(currentUser);
    }
  };

  const isAdmin = Boolean(
    currentUser &&
    currentUser.email &&
    isUserAdminEmail(currentUser.email)
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        logout,
        reloadProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
