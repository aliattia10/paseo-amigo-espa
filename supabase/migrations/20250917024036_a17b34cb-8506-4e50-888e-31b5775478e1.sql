-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('owner', 'walker')),
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT NULL,
  total_reviews INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dogs table
CREATE TABLE public.dogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_years INTEGER NOT NULL,
  breed TEXT,
  photo_url TEXT,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create walk requests table
CREATE TABLE public.walk_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  walker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL DEFAULT 'walk' CHECK (service_type IN ('walk', 'hourly_care')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  duration_minutes INTEGER,
  notes TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  walk_request_id UUID NOT NULL REFERENCES public.walk_requests(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  tags TEXT[], -- Tags like 'punctual', 'great_with_dogs', 'kind'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  walk_request_id UUID NOT NULL REFERENCES public.walk_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walk_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Walker profiles are publicly viewable" 
ON public.profiles FOR SELECT 
USING (user_type = 'walker');

-- RLS Policies for dogs
CREATE POLICY "Owners can manage their dogs" 
ON public.dogs FOR ALL 
USING (owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Walkers can view dogs for accepted requests" 
ON public.dogs FOR SELECT 
USING (id IN (
  SELECT dog_id FROM public.walk_requests 
  WHERE walker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
));

-- RLS Policies for walk_requests
CREATE POLICY "Users can view their own requests" 
ON public.walk_requests FOR SELECT 
USING (
  owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  walker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Owners can create requests" 
ON public.walk_requests FOR INSERT 
WITH CHECK (owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own requests" 
ON public.walk_requests FOR UPDATE 
USING (
  owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  walker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for reviews
CREATE POLICY "Reviews are publicly viewable" 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews for completed walks" 
ON public.reviews FOR INSERT 
WITH CHECK (
  reviewer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
  walk_request_id IN (
    SELECT id FROM public.walk_requests 
    WHERE status = 'completed' AND (
      owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
      walker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages for their requests" 
ON public.chat_messages FOR SELECT 
USING (
  walk_request_id IN (
    SELECT id FROM public.walk_requests 
    WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
          walker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages for their requests" 
ON public.chat_messages FOR INSERT 
WITH CHECK (
  sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
  walk_request_id IN (
    SELECT id FROM public.walk_requests 
    WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
          walker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at
  BEFORE UPDATE ON public.dogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_walk_requests_updated_at
  BEFORE UPDATE ON public.walk_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, city, postal_code, phone, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'postal_code', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();