# 🌍 Remaining Hardcoded English Text - Complete Translation Guide

## Summary
This document lists ALL remaining hardcoded English text found in the codebase that needs to be replaced with i18n translation keys.

---

## 📄 Files with Hardcoded Text

### **src/pages/AvailabilityPage.tsx**
```typescript
// Line 222
"Add Availability Slot" → t('availability.addSlot')
```

**Translations needed:**
```json
{
  "availability": {
    "addSlot": "Add Availability Slot",
    "addSlot_es": "Añadir Horario Disponible",
    "addSlot_fr": "Ajouter un Créneau de Disponibilité"
  }
}
```

---

### **src/pages/PetEditPage.tsx**
```typescript
// Line 571
"Uploading..." → t('common.uploading')
"Maximum 6 photos" → t('pet.maxPhotos')
`Add Photo (${count}/6)` → t('pet.addPhoto', { count, max: 6 })

// Line 577
"Uploading..." → t('common.uploading')
```

**Translations needed:**
```json
{
  "common": {
    "uploading": "Uploading...",
    "uploading_es": "Subiendo...",
    "uploading_fr": "Téléchargement..."
  },
  "pet": {
    "maxPhotos": "Maximum 6 photos",
    "maxPhotos_es": "Máximo 6 fotos",
    "maxPhotos_fr": "Maximum 6 photos",
    "addPhoto": "Add Photo ({{count}}/{{max}})",
    "addPhoto_es": "Añadir Foto ({{count}}/{{max}})",
    "addPhoto_fr": "Ajouter Photo ({{count}}/{{max}})"
  }
}
```

---

### **src/pages/PaymentPage.tsx**
```typescript
// Line 180
"Service:" → t('payment.service')

// Line 182
"Walk" → t('payment.walk')

// Line 185
"Total Amount:" → t('payment.totalAmount')

// Line 199
"Sitter receives:" → t('payment.sitterReceives')
```

**Translations needed:**
```json
{
  "payment": {
    "service": "Service:",
    "service_es": "Servicio:",
    "service_fr": "Service:",
    "walk": "Walk",
    "walk_es": "Paseo",
    "walk_fr": "Promenade",
    "totalAmount": "Total Amount:",
    "totalAmount_es": "Monto Total:",
    "totalAmount_fr": "Montant Total:",
    "sitterReceives": "Sitter receives:",
    "sitterReceives_es": "El cuidador recibe:",
    "sitterReceives_fr": "Le gardien reçoit:"
  }
}
```

---

### **src/pages/BookingsPage.tsx**
```typescript
// Line 349-350
"Accept" → t('bookings.accept')
"Decline" → t('bookings.decline')

// Line 449
"Cancel & Refund" → t('bookings.cancelRefund')
```

**Translations needed:**
```json
{
  "bookings": {
    "accept": "Accept",
    "accept_es": "Aceptar",
    "accept_fr": "Accepter",
    "decline": "Decline",
    "decline_es": "Rechazar",
    "decline_fr": "Refuser",
    "cancelRefund": "Cancel & Refund",
    "cancelRefund_es": "Cancelar y Reembolsar",
    "cancelRefund_fr": "Annuler et Rembourser"
  }
}
```

---

### **src/pages/PublicProfilePage.tsx**
```typescript
// Line 133
"Edit Profile" (title attribute) → t('profile.editProfile')

// Line 164
"Location not set" → t('profile.locationNotSet')

// Line 232
"About Me" → t('profile.aboutMe')

// Line 328
"Edit Profile" (button) → t('profile.editProfile')
```

**Translations needed:**
```json
{
  "profile": {
    "editProfile": "Edit Profile",
    "editProfile_es": "Editar Perfil",
    "editProfile_fr": "Modifier le Profil",
    "locationNotSet": "Location not set",
    "locationNotSet_es": "Ubicación no establecida",
    "locationNotSet_fr": "Emplacement non défini",
    "aboutMe": "About Me",
    "aboutMe_es": "Sobre Mí",
    "aboutMe_fr": "À Propos de Moi"
  }
}
```

---

### **src/pages/ProfileEditPage.tsx**
```typescript
// Line 373
"Edit Profile" → t('profile.editProfile')

// Line 436
"About Me" → t('profile.aboutMe')
```

---

### **src/pages/BookingRequestPage.tsx**
```typescript
// Line 329
"You won't be charged until the walker accepts your request" → t('booking.chargeNotice')
```

**Translations needed:**
```json
{
  "booking": {
    "chargeNotice": "You won't be charged until the walker accepts your request",
    "chargeNotice_es": "No se te cobrará hasta que el paseador acepte tu solicitud",
    "chargeNotice_fr": "Vous ne serez pas facturé tant que le promeneur n'aura pas accepté votre demande"
  }
}
```

---

### **src/pages/NotificationsPage.tsx**
```typescript
// Lines 212, 224, 236
"All" → t('notifications.filter.all')
"Messages" → t('notifications.filter.messages')
"Bookings" → t('notifications.filter.bookings')
```

**Translations needed:**
```json
{
  "notifications": {
    "filter": {
      "all": "All",
      "all_es": "Todos",
      "all_fr": "Tous",
      "messages": "Messages",
      "messages_es": "Mensajes",
      "messages_fr": "Messages",
      "bookings": "Bookings",
      "bookings_es": "Reservas",
      "bookings_fr": "Réservations"
    }
  }
}
```

---

### **src/pages/NotFound.tsx**
```typescript
// Line 18
"404" → Keep as is (number)
"Oops! Page not found" → t('error.pageNotFound')

// Line 21
"Return to Home" → t('error.returnHome')
```

**Translations needed:**
```json
{
  "error": {
    "pageNotFound": "Oops! Page not found",
    "pageNotFound_es": "¡Ups! Página no encontrada",
    "pageNotFound_fr": "Oups! Page non trouvée",
    "returnHome": "Return to Home",
    "returnHome_es": "Volver al Inicio",
    "returnHome_fr": "Retour à l'Accueil"
  }
}
```

---

### **src/pages/ForgotPassword.tsx**
```typescript
// Line 120
"Petflik" → Keep as brand name
```

---

### **src/pages/OnboardingRouter.tsx**
```typescript
// Line 46
"Cargando..." → t('common.loading')
```

---

### **src/pages/UserProfilePage.tsx**
```typescript
// Line 105
"About me" → t('profile.aboutMe')
```

---

## 📊 Complete Translation Keys Summary

### Add to `src/lib/i18n.ts`:

```typescript
// English
{
  "availability": {
    "addSlot": "Add Availability Slot"
  },
  "pet": {
    "maxPhotos": "Maximum 6 photos",
    "addPhoto": "Add Photo ({{count}}/{{max}})"
  },
  "payment": {
    "service": "Service:",
    "walk": "Walk",
    "totalAmount": "Total Amount:",
    "sitterReceives": "Sitter receives:"
  },
  "bookings": {
    "accept": "Accept",
    "decline": "Decline",
    "cancelRefund": "Cancel & Refund"
  },
  "profile": {
    "editProfile": "Edit Profile",
    "locationNotSet": "Location not set",
    "aboutMe": "About Me"
  },
  "booking": {
    "chargeNotice": "You won't be charged until the walker accepts your request"
  },
  "notifications": {
    "filter": {
      "all": "All",
      "messages": "Messages",
      "bookings": "Bookings"
    }
  },
  "error": {
    "pageNotFound": "Oops! Page not found",
    "returnHome": "Return to Home"
  },
  "common": {
    "uploading": "Uploading...",
    "loading": "Loading..."
  }
}

// Spanish
{
  "availability": {
    "addSlot": "Añadir Horario Disponible"
  },
  "pet": {
    "maxPhotos": "Máximo 6 fotos",
    "addPhoto": "Añadir Foto ({{count}}/{{max}})"
  },
  "payment": {
    "service": "Servicio:",
    "walk": "Paseo",
    "totalAmount": "Monto Total:",
    "sitterReceives": "El cuidador recibe:"
  },
  "bookings": {
    "accept": "Aceptar",
    "decline": "Rechazar",
    "cancelRefund": "Cancelar y Reembolsar"
  },
  "profile": {
    "editProfile": "Editar Perfil",
    "locationNotSet": "Ubicación no establecida",
    "aboutMe": "Sobre Mí"
  },
  "booking": {
    "chargeNotice": "No se te cobrará hasta que el paseador acepte tu solicitud"
  },
  "notifications": {
    "filter": {
      "all": "Todos",
      "messages": "Mensajes",
      "bookings": "Reservas"
    }
  },
  "error": {
    "pageNotFound": "¡Ups! Página no encontrada",
    "returnHome": "Volver al Inicio"
  },
  "common": {
    "uploading": "Subiendo...",
    "loading": "Cargando..."
  }
}

// French
{
  "availability": {
    "addSlot": "Ajouter un Créneau de Disponibilité"
  },
  "pet": {
    "maxPhotos": "Maximum 6 photos",
    "addPhoto": "Ajouter Photo ({{count}}/{{max}})"
  },
  "payment": {
    "service": "Service:",
    "walk": "Promenade",
    "totalAmount": "Montant Total:",
    "sitterReceives": "Le gardien reçoit:"
  },
  "bookings": {
    "accept": "Accepter",
    "decline": "Refuser",
    "cancelRefund": "Annuler et Rembourser"
  },
  "profile": {
    "editProfile": "Modifier le Profil",
    "locationNotSet": "Emplacement non défini",
    "aboutMe": "À Propos de Moi"
  },
  "booking": {
    "chargeNotice": "Vous ne serez pas facturé tant que le promeneur n'aura pas accepté votre demande"
  },
  "notifications": {
    "filter": {
      "all": "Tous",
      "messages": "Messages",
      "bookings": "Réservations"
    }
  },
  "error": {
    "pageNotFound": "Oups! Page non trouvée",
    "returnHome": "Retour à l'Accueil"
  },
  "common": {
    "uploading": "Téléchargement...",
    "loading": "Chargement..."
  }
}
```

---

## ✅ Next Steps

1. Add all translation keys to `src/lib/i18n.ts`
2. Replace hardcoded text in each file with `t('key.name')`
3. Test language switching
4. Verify all pages display correctly in all 3 languages

---

## 📝 Files to Update (Priority Order)

1. ✅ **High Priority** (User-facing):
   - BookingsPage.tsx
   - PaymentPage.tsx
   - PublicProfilePage.tsx
   - ProfileEditPage.tsx
   - PetEditPage.tsx

2. ✅ **Medium Priority**:
   - AvailabilityPage.tsx
   - BookingRequestPage.tsx
   - NotificationsPage.tsx

3. ✅ **Low Priority**:
   - NotFound.tsx
   - OnboardingRouter.tsx
   - UserProfilePage.tsx
