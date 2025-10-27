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
  verified?: boolean;
  distanceKm?: number; // For proximity search results
  createdAt: Date;
  updatedAt: Date;
}

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  age: string;
  breed?: string;
  notes: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
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
  activityType: 'walk_completed' | 'new_match' | 'review_received' | 'profile_updated' | 'new_dog';
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
