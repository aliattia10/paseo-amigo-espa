import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { User, Dog, WalkerProfile, WalkRequest, ChatMessage, Review } from '@/types';

// User Services
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as User;
  }
  return null;
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...userData,
    updatedAt: serverTimestamp()
  });
};

// Dog Services
export const createDog = async (dogData: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'dogs'), {
    ...dogData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getDogsByOwner = async (ownerId: string): Promise<Dog[]> => {
  const q = query(collection(db, 'dogs'), where('ownerId', '==', ownerId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as Dog[];
};

export const updateDog = async (dogId: string, dogData: Partial<Dog>) => {
  const docRef = doc(db, 'dogs', dogId);
  await updateDoc(docRef, {
    ...dogData,
    updatedAt: serverTimestamp()
  });
};

// Walker Profile Services
export const createWalkerProfile = async (profileData: Omit<WalkerProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'walkerProfiles'), {
    ...profileData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getWalkerProfile = async (userId: string): Promise<WalkerProfile | null> => {
  const q = query(collection(db, 'walkerProfiles'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as WalkerProfile;
  }
  return null;
};

export const getNearbyWalkers = async (city: string): Promise<WalkerProfile[]> => {
  const q = query(
    collection(db, 'walkerProfiles'),
    where('verified', '==', true),
    orderBy('rating', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as WalkerProfile[];
};

// Walk Request Services
export const createWalkRequest = async (requestData: Omit<WalkRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'walkRequests'), {
    ...requestData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getWalkRequestsByOwner = async (ownerId: string): Promise<WalkRequest[]> => {
  const q = query(
    collection(db, 'walkRequests'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as WalkRequest[];
};

export const getWalkRequestsByWalker = async (walkerId: string): Promise<WalkRequest[]> => {
  const q = query(
    collection(db, 'walkRequests'),
    where('walkerId', '==', walkerId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as WalkRequest[];
};

export const updateWalkRequest = async (requestId: string, requestData: Partial<WalkRequest>) => {
  const docRef = doc(db, 'walkRequests', requestId);
  await updateDoc(docRef, {
    ...requestData,
    updatedAt: serverTimestamp()
  });
};

// Chat Services
export const sendMessage = async (messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  const docRef = await addDoc(collection(db, 'chatMessages'), {
    ...messageData,
    timestamp: serverTimestamp()
  });
  return docRef.id;
};

export const getChatMessages = async (requestId: string): Promise<ChatMessage[]> => {
  const q = query(
    collection(db, 'chatMessages'),
    where('requestId', '==', requestId),
    orderBy('timestamp', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate()
  })) as ChatMessage[];
};

// Review Services
export const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...reviewData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getReviewsByUser = async (userId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    where('reviewedId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  })) as Review[];
};

// File Upload Service
export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

// Real-time listeners
export const subscribeToWalkRequests = (walkerId: string, callback: (requests: WalkRequest[]) => void) => {
  const q = query(
    collection(db, 'walkRequests'),
    where('walkerId', '==', walkerId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as WalkRequest[];
    callback(requests);
  });
};

export const subscribeToChatMessages = (requestId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, 'chatMessages'),
    where('requestId', '==', requestId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    })) as ChatMessage[];
    callback(messages);
  });
}; 