// Autenticación real del administrador con Firebase Auth (Google).
// IMPORTANTE: esta verificación en el navegador es solo para la experiencia de uso.
// La protección real de los datos está en firestore.rules (isAdmin()).
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Debe coincidir con el correo "bootstrap" de firestore.rules
export const ADMIN_EMAILS = ['bananur.cl@gmail.com'];

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

async function isAuthorizedAdmin(user: User): Promise<boolean> {
  if (!user.email || !user.emailVerified) return false;
  if (ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export function subscribeAdmin(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user && (await isAuthorizedAdmin(user))) {
      callback(user);
    } else {
      callback(null);
    }
  });
}

export async function adminSignIn(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, provider);
    if (!(await isAuthorizedAdmin(result.user))) {
      await signOut(auth);
      throw new Error('Esta cuenta de Google no tiene permisos de administrador.');
    }
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      return null;
    }
    if (error?.code === 'auth/unauthorized-domain') {
      throw new Error('Este dominio no está autorizado en Firebase Authentication.');
    }
    throw error;
  }
}

export async function adminSignOut() {
  await signOut(auth);
}
