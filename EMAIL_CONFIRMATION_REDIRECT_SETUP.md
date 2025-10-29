# Email Confirmation Redirect Setup

## Issue
When users sign up, the email confirmation link should redirect them to continue setting up their profile (owner or sitter setup page).

## Solution

### Step 1: Configure Supabase Email Redirect

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Go to Authentication Settings**
   - Click **Authentication** in left sidebar
   - Click **URL Configuration**

3. **Set Redirect URLs**
   Add these URLs to the **Redirect URLs** list:
   ```
   https://petflik.com/pet-profile-setup
   https://petflik.com/sitter-profile-setup
   https://petflik.com/dashboard
   https://petflik.com/auth
   ```

4. **Set Site URL**
   - Site URL: `https://petflik.com`

### Step 2: Configure Email Templates

1. **Go to Email Templates**
   - Authentication → Email Templates
   - Click **Confirm signup**

2. **Update Confirmation Link**
   The default template has:
   ```html
   <a href="{{ .ConfirmationURL }}">Confirm your email</a>
   ```

   Change it to include a redirect parameter:
   ```html
   <a href="{{ .ConfirmationURL }}?redirect_to=/auth?confirmed=true">Confirm your email</a>
   ```

### Step 3: Handle Redirect in Code

The code in `AuthNew.tsx` already handles this:

```typescript
// After successful signup
if (selectedRole === 'owner') {
  navigate('/pet-profile-setup');
} else if (selectedRole === 'walker') {
  navigate('/sitter-profile-setup');
}
```

### Step 4: Add Confirmation Handler

Update `AuthNew.tsx` to check for confirmation:

```typescript
useEffect(() => {
  // Check if user just confirmed email
  const params = new URLSearchParams(window.location.search);
  if (params.get('confirmed') === 'true') {
    // User confirmed email, check their role and redirect
    if (userProfile?.role === 'owner') {
      navigate('/pet-profile-setup');
    } else if (userProfile?.role === 'sitter') {
      navigate('/sitter-profile-setup');
    }
  }
}, [userProfile]);
```

## Alternative: Dynamic Redirect Based on Role

### Option 1: Store Role in Session
When user signs up, store their role in localStorage:
```typescript
localStorage.setItem('pendingRole', selectedRole);
```

Then in the confirmation handler:
```typescript
const pendingRole = localStorage.getItem('pendingRole');
if (pendingRole === 'owner') {
  navigate('/pet-profile-setup');
} else if (pendingRole === 'sitter') {
  navigate('/sitter-profile-setup');
}
localStorage.removeItem('pendingRole');
```

### Option 2: Use Supabase User Metadata
Store role in user metadata during signup:
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: selectedRole
    }
  }
});
```

Then redirect based on metadata:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (user?.user_metadata?.role === 'owner') {
  navigate('/pet-profile-setup');
} else {
  navigate('/sitter-profile-setup');
}
```

## Testing

1. **Sign up as Owner**
   - Should receive email
   - Click confirmation link
   - Should redirect to `/pet-profile-setup`

2. **Sign up as Sitter**
   - Should receive email
   - Click confirmation link
   - Should redirect to `/sitter-profile-setup`

## Current Flow

```
User Signs Up
    ↓
Select Role (Owner/Sitter)
    ↓
Enter Email/Password
    ↓
Confirmation Email Sent
    ↓
User Clicks Link in Email
    ↓
Email Confirmed
    ↓
Redirect to Profile Setup
    ↓
Owner → /pet-profile-setup
Sitter → /sitter-profile-setup
```

## Notes

- Email confirmation is handled by Supabase
- Redirect URL must be whitelisted in Supabase settings
- Role information needs to be preserved between signup and confirmation
- Consider using user metadata for role storage

## Quick Fix (Recommended)

The easiest solution is to:
1. Store role in user metadata during signup
2. Configure Supabase redirect to `/auth?confirmed=true`
3. Check user metadata and redirect accordingly

This way, the role is stored securely in Supabase and available after confirmation.
