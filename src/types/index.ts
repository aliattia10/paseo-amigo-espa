export enum UserType {
  Owner = 'owner',
  Walker = 'walker',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  userType: 'owner' | 'walker';
  profileImage?: string;
  bio?: string;
  experience?: number;
  latitude?: number;
  longitude?: number;
  hourlyRate?: number;
  availability?: string[];
  rating?: number;
  totalWalks?: number;
  /** Sitter: years of pet care experience */
  yearsExperience?: number | null;
  /** Sitter: total pets cared for */
  petsCaredFor?: number | null;
  /** Sitter: age in years */
  sitterAge?: number | null;
  /** Sitter: has prior pet experience */
  hasPetExperience?: boolean | null;
  /** Sitter: free-text description of experience (e.g. "6 months", "since I was a kid") */
  experienceDescription?: string | null;
  /** Sitter: e.g. ["Hiking", "Reading"] */
  hobbies?: string[] | null;
  /** Sitter: e.g. { size: ["small","medium"], type: ["dog","cat"] } */
  preferences?: Record<string, unknown> | null;
  verified?: boolean;
  /** KYC: verified | pending | rejected */
  verificationStatus?: string | null;
  /** AI face-match confidence 0..1 */
  kycConfidence?: number | null;
  /** KYC payload (e.g. ocr_text, status from /verify) */
  kycData?: Record<string, unknown> | null;
  distanceKm?: number; // For proximity search results
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  petType: 'dog' | 'cat';
  age: string;
  ageYears?: number | null;
  ageMonths?: number | null;
  breed?: string;
  customBreed?: string;
  petSize?: 'small' | 'medium' | 'large';
  allergies?: string;
  healthIssues?: string;
  notes: string;
  imageUrl?: string;
  /** Current status e.g. Happy, Sleepy, Energetic */
  mood?: string | null;
  /** e.g. Friendly, Shy, Playful */
  personalityTags?: string[] | null;
  temperament?: string[];
  specialNeeds?: string;
  energyLevel?: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

// Keep Dog interface for backward compatibility
export interface Dog extends Omit<Pet, 'petType'> {
  petType?: 'dog' | 'cat';
}

export interface WalkerProfile {
  id: string;
  userId: string;
  userName?: string;
  userCity?: string;
  userImage?: string;
  bio: string;
  experience: string;
  hourlyRate: number;
  availability: string[];
  rating: number;
  totalWalks: number;
  verified: boolean;
  tags: string[];
  // Pet preferences
  petPreferences?: {
    dogs: boolean;
    cats: boolean;
    both?: boolean;
  };
  dogExperience?: string;
  catExperience?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalkRequest {
  id: string;
  ownerId: string;
  walkerId: string;
  dogId: string;
  serviceType: 'walk' | 'care';
  duration: number; // in minutes
  date: Date;
  time: string;
  location: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  message: string;
  timestamp: Date;
}

export interface Review {
  id: string;
  walkRequestId: string;
  reviewerId: string;
  reviewedId: string;
  rating: number;
  tags: string[];
  comment?: string;
  createdAt: Date;
}

export interface WalkSession {
  id: string;
  walkRequestId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  distance?: number; // in km
  route?: GeoPoint[];
  status: 'active' | 'completed';
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | '6months' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: Date;
}

// Match types for Tinder-style functionality
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  matchType: 'like' | 'superlike' | 'pass';
  isMutual: boolean;
  matchedAt?: Date;
  createdAt: Date;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  activityType: 'walk_completed' | 'new_match' | 'review_received' | 'profile_updated' | 'new_pet' | 'new_dog';
  activityData: {
    [key: string]: any;
  };
  isPublic: boolean;
  createdAt: Date;
}

export interface NearbyWalker extends User {
  distanceEstimate: number;
  walkerProfile: WalkerProfile;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  coverImage?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}