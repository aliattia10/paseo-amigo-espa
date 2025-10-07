import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.findWalker': 'Find Walker',
      'nav.messages': 'Messages',
      'nav.profile': 'Profile',
      'nav.subscription': 'Subscription',
      
      // Auth
      'auth.login': 'Login',
      'auth.signup': 'Sign Up',
      'auth.logout': 'Logout',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.name': 'Name',
      'auth.phone': 'Phone',
      'auth.city': 'City',
      'auth.postalCode': 'Postal Code',
      'auth.userType': 'User Type',
      'auth.dogOwner': 'I am a dog owner',
      'auth.wantToWalk': 'I want to walk dogs',
      'auth.createAccount': 'Create Account',
      'auth.alreadyHaveAccount': 'Already have an account? Log in here',
      'auth.welcome': 'Welcome!',
      'auth.loginSuccess': 'You have successfully logged in.',
      'auth.accountCreated': 'Account created!',
      'auth.accountCreatedSuccess': 'Your account has been created successfully.',
      'auth.loginError': 'Login error',
      'auth.signupError': 'Error creating account',
      'auth.passwordsDontMatch': 'Passwords do not match.',
      'auth.tryAgain': 'Please try again.',
      'auth.rateLimitTitle': 'Rate limit reached',
      'auth.rateLimitMessage': 'For security purposes, please wait a moment before trying again',
      'auth.emailExistsTitle': 'Email already registered',
      'auth.emailExistsMessage': 'This email is already registered. Please try logging in',
      'auth.confirmingEmail': 'Confirming your email...',
      'auth.pleaseWait': 'Please wait while we verify your email address',
      'auth.emailConfirmed': 'Email confirmed successfully!',
      'auth.welcomeToApp': 'Welcome to Paseo! You can now access all features',
      'auth.confirmationError': 'Email confirmation failed',
      'auth.emailExpired': 'Email confirmation link has expired. Please request a new one',
      'auth.accessDenied': 'Access denied. Please try again',
      'auth.sessionError': 'Failed to establish session. Please try logging in',
      'auth.noSession': 'No valid session found. Please try again',
      'auth.redirectingHome': 'Redirecting you to the home page...',
      'auth.forgotPassword': 'Forgot your password?',
      'auth.resetPassword': 'Reset Password',
      'auth.sendResetLink': 'Send Reset Link',
      'auth.resetPasswordSent': 'Reset link sent!',
      'auth.checkEmailForReset': 'Check your email for the password reset link',
      'auth.resetPasswordError': 'Error sending reset link',
      'auth.enterEmailFirst': 'Please enter your email address first',
      'auth.validatingResetLink': 'Validating reset link...',
      'auth.setNewPassword': 'Set New Password',
      'auth.enterNewPassword': 'Enter your new password below',
      'auth.newPassword': 'New Password',
      'auth.confirmNewPassword': 'Confirm New Password',
      'auth.updatePassword': 'Update Password',
      'auth.passwordUpdated': 'Password Updated!',
      'auth.passwordUpdatedSuccess': 'Your password has been updated successfully',
      'auth.passwordTooShort': 'Password must be at least 6 characters long',
      'auth.noValidSession': 'No valid session found. Please request a new reset link',
      
      // Dashboard
      'dashboard.welcome': 'Welcome to Paseo',
      'dashboard.findPerfectWalker': 'Find the perfect walker for your dog',
      'dashboard.myDogs': 'My Dogs',
      'dashboard.addDog': 'Add Dog',
      'dashboard.upcomingWalks': 'Upcoming Walks',
      'dashboard.recentWalks': 'Recent Walks',
      'dashboard.findWalkers': 'Find Walkers',
      'dashboard.availableWalkers': 'Available Walkers',
      'dashboard.bookWalk': 'Book Walk',
      'dashboard.viewProfile': 'View Profile',
      
      // Dog Management
      'dog.addNew': 'Add New Dog',
      'dog.name': 'Dog Name',
      'dog.age': 'Age',
      'dog.breed': 'Breed',
      'dog.notes': 'Notes',
      'dog.image': 'Image',
      'dog.save': 'Save Dog',
      'dog.cancel': 'Cancel',
      'dog.edit': 'Edit Dog',
      'dog.delete': 'Delete Dog',
      
      // Walker Profile
      'walker.bio': 'Bio',
      'walker.experience': 'Experience',
      'walker.hourlyRate': 'Hourly Rate',
      'walker.availability': 'Availability',
      'walker.rating': 'Rating',
      'walker.totalWalks': 'Total Walks',
      'walker.verified': 'Verified',
      'walker.tags': 'Tags',
      'walker.bookNow': 'Book Now',
      'walker.contact': 'Contact',
      
      // Walk Requests
      'walk.requestWalk': 'Request Walk',
      'walk.selectDog': 'Select Dog',
      'walk.selectWalker': 'Select Walker',
      'walk.serviceType': 'Service Type',
      'walk.duration': 'Duration (minutes)',
      'walk.date': 'Date',
      'walk.time': 'Time',
      'walk.location': 'Location',
      'walk.notes': 'Notes',
      'walk.price': 'Price',
      'walk.submit': 'Submit Request',
      'walk.pending': 'Pending',
      'walk.accepted': 'Accepted',
      'walk.inProgress': 'In Progress',
      'walk.completed': 'Completed',
      'walk.cancelled': 'Cancelled',
      
      // Subscription
      'subscription.plans': 'Subscription Plans',
      'subscription.basic': 'Basic',
      'subscription.premium': 'Premium',
      'subscription.annual': 'Annual',
      'subscription.monthly': 'Monthly',
      'subscription.yearly': 'Yearly',
      'subscription.features': 'Features',
      'subscription.subscribe': 'Subscribe',
      'subscription.currentPlan': 'Current Plan',
      'subscription.manage': 'Manage Subscription',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.confirm': 'Confirm',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.close': 'Close',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.sort': 'Sort',
      'common.refresh': 'Refresh',
      'common.retry': 'Retry',
      'common.tryAgain': 'Try Again',
      'common.getStarted': 'Get Started',
      
      // Time
      'time.monday': 'Monday',
      'time.tuesday': 'Tuesday',
      'time.wednesday': 'Wednesday',
      'time.thursday': 'Thursday',
      'time.friday': 'Friday',
      'time.saturday': 'Saturday',
      'time.sunday': 'Sunday',
      
      // App Info
      'app.title': 'Paseo - Find the perfect walker for your dog',
      'app.description': 'Connect with trusted dog walkers in your area',
      'app.tagline': 'Your dog deserves the best care',
      
      // Home Page
      'home.heroTitle': 'Find the perfect walker for your dog',
      'home.heroSubtitle': 'Connect with trusted, experienced dog walkers in your neighborhood. Book walks instantly and get real-time updates.',
      'home.getStarted': 'Get Started',
      'home.signIn': 'Sign In',
      'home.verifiedWalkers': 'Verified Walkers',
      'home.support247': '24/7 Support',
      'home.happyDogs': 'Happy Dogs',
      'home.howItWorks': 'How it works',
      'home.howItWorksSubtitle': 'Simple steps to get your dog the care they deserve',
      'home.step1Title': 'Find Walkers',
      'home.step1Description': 'Browse verified walkers in your area with ratings and reviews.',
      'home.step2Title': 'Book a Walk',
      'home.step2Description': 'Schedule walks at your convenience with instant confirmation.',
      'home.step3Title': 'Stay Updated',
      'home.step3Description': 'Get real-time updates and photos during your dog\'s walk.',
      'home.testimonialsTitle': 'What pet owners say',
      'home.luciaTestimonial': 'Paseo has been amazing! My dog Max loves his walks with Manuel. The app is easy to use and I get updates during every walk.',
      'home.manuelTestimonial': 'I\'ve been walking dogs through Paseo for 2 years. The flexibility is perfect and I love meeting new dogs.',
      'home.lucasTestimonial': 'Bella is always excited when her walker arrives! The service is reliable and the walkers are great with dogs.',
      'home.verifiedWalkersCount': 'Verified Walkers',
      'home.citiesCount': 'Cities',
      'home.rating': 'Rating',
      'home.readyToStart': 'Ready to get started?',
      'home.readyToStartSubtitle': 'Join thousands of pet owners who trust Paseo for their dog\'s care.',
      'home.startFreeToday': 'Start Free Today',
      'home.learnMore': 'Learn More',
    }
  },
  fr: {
    translation: {
      // Navigation
      'nav.home': 'Accueil',
      'nav.findWalker': 'Trouver un Promeneur',
      'nav.messages': 'Messages',
      'nav.profile': 'Profil',
      'nav.subscription': 'Abonnement',
      
      // Auth
      'auth.login': 'Connexion',
      'auth.signup': 'S\'inscrire',
      'auth.logout': 'Déconnexion',
      'auth.email': 'Email',
      'auth.password': 'Mot de passe',
      'auth.confirmPassword': 'Confirmer le mot de passe',
      'auth.name': 'Nom',
      'auth.phone': 'Téléphone',
      'auth.city': 'Ville',
      'auth.postalCode': 'Code postal',
      'auth.userType': 'Type d\'utilisateur',
      'auth.dogOwner': 'Je suis propriétaire d\'un chien',
      'auth.wantToWalk': 'Je veux promener des chiens',
      'auth.createAccount': 'Créer un compte',
      'auth.alreadyHaveAccount': 'Vous avez déjà un compte ? Connectez-vous ici',
      'auth.welcome': 'Bienvenue !',
      'auth.loginSuccess': 'Vous vous êtes connecté avec succès.',
      'auth.accountCreated': 'Compte créé !',
      'auth.accountCreatedSuccess': 'Votre compte a été créé avec succès.',
      'auth.loginError': 'Erreur de connexion',
      'auth.signupError': 'Erreur lors de la création du compte',
      'auth.passwordsDontMatch': 'Les mots de passe ne correspondent pas.',
      'auth.tryAgain': 'Veuillez réessayer.',
      'auth.rateLimitTitle': 'Limite de taux atteinte',
      'auth.rateLimitMessage': 'Pour des raisons de sécurité, attendez un moment avant de réessayer',
      'auth.emailExistsTitle': 'Email déjà enregistré',
      'auth.emailExistsMessage': 'Cet email est déjà enregistré. Essayez de vous connecter',
      
      // Dashboard
      'dashboard.welcome': 'Bienvenue sur Paseo',
      'dashboard.findPerfectWalker': 'Trouvez le promeneur parfait pour votre chien',
      'dashboard.myDogs': 'Mes Chiens',
      'dashboard.addDog': 'Ajouter un Chien',
      'dashboard.upcomingWalks': 'Promenades à Venir',
      'dashboard.recentWalks': 'Promenades Récentes',
      'dashboard.findWalkers': 'Trouver des Promeneurs',
      'dashboard.availableWalkers': 'Promeneurs Disponibles',
      'dashboard.bookWalk': 'Réserver une Promenade',
      'dashboard.viewProfile': 'Voir le Profil',
      
      // Dog Management
      'dog.addNew': 'Ajouter un Nouveau Chien',
      'dog.name': 'Nom du Chien',
      'dog.age': 'Âge',
      'dog.breed': 'Race',
      'dog.notes': 'Notes',
      'dog.image': 'Image',
      'dog.save': 'Sauvegarder le Chien',
      'dog.cancel': 'Annuler',
      'dog.edit': 'Modifier le Chien',
      'dog.delete': 'Supprimer le Chien',
      
      // Walker Profile
      'walker.bio': 'Biographie',
      'walker.experience': 'Expérience',
      'walker.hourlyRate': 'Tarif Horaire',
      'walker.availability': 'Disponibilité',
      'walker.rating': 'Note',
      'walker.totalWalks': 'Promenades Totales',
      'walker.verified': 'Vérifié',
      'walker.tags': 'Étiquettes',
      'walker.bookNow': 'Réserver Maintenant',
      'walker.contact': 'Contacter',
      
      // Walk Requests
      'walk.requestWalk': 'Demander une Promenade',
      'walk.selectDog': 'Sélectionner un Chien',
      'walk.selectWalker': 'Sélectionner un Promeneur',
      'walk.serviceType': 'Type de Service',
      'walk.duration': 'Durée (minutes)',
      'walk.date': 'Date',
      'walk.time': 'Heure',
      'walk.location': 'Lieu',
      'walk.notes': 'Notes',
      'walk.price': 'Prix',
      'walk.submit': 'Soumettre la Demande',
      'walk.pending': 'En Attente',
      'walk.accepted': 'Accepté',
      'walk.inProgress': 'En Cours',
      'walk.completed': 'Terminé',
      'walk.cancelled': 'Annulé',
      
      // Subscription
      'subscription.plans': 'Plans d\'Abonnement',
      'subscription.basic': 'Basique',
      'subscription.premium': 'Premium',
      'subscription.annual': 'Annuel',
      'subscription.monthly': 'Mensuel',
      'subscription.yearly': 'Annuel',
      'subscription.features': 'Fonctionnalités',
      'subscription.subscribe': 'S\'abonner',
      'subscription.currentPlan': 'Plan Actuel',
      'subscription.manage': 'Gérer l\'Abonnement',
      
      // Common
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      'common.cancel': 'Annuler',
      'common.save': 'Sauvegarder',
      'common.edit': 'Modifier',
      'common.delete': 'Supprimer',
      'common.confirm': 'Confirmer',
      'common.back': 'Retour',
      'common.next': 'Suivant',
      'common.previous': 'Précédent',
      'common.close': 'Fermer',
      'common.yes': 'Oui',
      'common.no': 'Non',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.sort': 'Trier',
      'common.refresh': 'Actualiser',
      'common.retry': 'Réessayer',
      'common.tryAgain': 'Réessayer',
      'common.getStarted': 'Commencer',
      
      // Time
      'time.monday': 'Lundi',
      'time.tuesday': 'Mardi',
      'time.wednesday': 'Mercredi',
      'time.thursday': 'Jeudi',
      'time.friday': 'Vendredi',
      'time.saturday': 'Samedi',
      'time.sunday': 'Dimanche',
      
      // App Info
      'app.title': 'Paseo - Trouvez le promeneur parfait pour votre chien',
      'app.description': 'Connectez-vous avec des promeneurs de chiens de confiance dans votre région',
      'app.tagline': 'Votre chien mérite les meilleurs soins',
    }
  },
  de: {
    translation: {
      // Navigation
      'nav.home': 'Startseite',
      'nav.findWalker': 'Gassi-Geher Finden',
      'nav.messages': 'Nachrichten',
      'nav.profile': 'Profil',
      'nav.subscription': 'Abonnement',
      
      // Auth
      'auth.login': 'Anmelden',
      'auth.signup': 'Registrieren',
      'auth.logout': 'Abmelden',
      'auth.email': 'E-Mail',
      'auth.password': 'Passwort',
      'auth.confirmPassword': 'Passwort bestätigen',
      'auth.name': 'Name',
      'auth.phone': 'Telefon',
      'auth.city': 'Stadt',
      'auth.postalCode': 'Postleitzahl',
      'auth.userType': 'Benutzertyp',
      'auth.dogOwner': 'Ich bin Hundebesitzer',
      'auth.wantToWalk': 'Ich möchte Hunde ausführen',
      'auth.createAccount': 'Konto erstellen',
      'auth.alreadyHaveAccount': 'Haben Sie bereits ein Konto? Hier anmelden',
      'auth.welcome': 'Willkommen!',
      'auth.loginSuccess': 'Sie haben sich erfolgreich angemeldet.',
      'auth.accountCreated': 'Konto erstellt!',
      'auth.accountCreatedSuccess': 'Ihr Konto wurde erfolgreich erstellt.',
      'auth.loginError': 'Anmeldefehler',
      'auth.signupError': 'Fehler beim Erstellen des Kontos',
      'auth.passwordsDontMatch': 'Passwörter stimmen nicht überein.',
      'auth.tryAgain': 'Bitte versuchen Sie es erneut.',
      'auth.rateLimitTitle': 'Geschwindigkeitsbegrenzung erreicht',
      'auth.rateLimitMessage': 'Aus Sicherheitsgründen warten Sie einen Moment, bevor Sie es erneut versuchen',
      'auth.emailExistsTitle': 'Email bereits registriert',
      'auth.emailExistsMessage': 'Diese Email ist bereits registriert. Versuchen Sie sich anzumelden',
      
      // Dashboard
      'dashboard.welcome': 'Willkommen bei Paseo',
      'dashboard.findPerfectWalker': 'Finden Sie den perfekten Gassi-Geher für Ihren Hund',
      'dashboard.myDogs': 'Meine Hunde',
      'dashboard.addDog': 'Hund hinzufügen',
      'dashboard.upcomingWalks': 'Bevorstehende Spaziergänge',
      'dashboard.recentWalks': 'Letzte Spaziergänge',
      'dashboard.findWalkers': 'Gassi-Geher Finden',
      'dashboard.availableWalkers': 'Verfügbare Gassi-Geher',
      'dashboard.bookWalk': 'Spaziergang Buchen',
      'dashboard.viewProfile': 'Profil Anzeigen',
      
      // Dog Management
      'dog.addNew': 'Neuen Hund Hinzufügen',
      'dog.name': 'Hundename',
      'dog.age': 'Alter',
      'dog.breed': 'Rasse',
      'dog.notes': 'Notizen',
      'dog.image': 'Bild',
      'dog.save': 'Hund Speichern',
      'dog.cancel': 'Abbrechen',
      'dog.edit': 'Hund Bearbeiten',
      'dog.delete': 'Hund Löschen',
      
      // Walker Profile
      'walker.bio': 'Biografie',
      'walker.experience': 'Erfahrung',
      'walker.hourlyRate': 'Stundensatz',
      'walker.availability': 'Verfügbarkeit',
      'walker.rating': 'Bewertung',
      'walker.totalWalks': 'Gesamte Spaziergänge',
      'walker.verified': 'Verifiziert',
      'walker.tags': 'Tags',
      'walker.bookNow': 'Jetzt Buchen',
      'walker.contact': 'Kontakt',
      
      // Walk Requests
      'walk.requestWalk': 'Spaziergang Anfordern',
      'walk.selectDog': 'Hund Auswählen',
      'walk.selectWalker': 'Gassi-Geher Auswählen',
      'walk.serviceType': 'Service-Typ',
      'walk.duration': 'Dauer (Minuten)',
      'walk.date': 'Datum',
      'walk.time': 'Zeit',
      'walk.location': 'Ort',
      'walk.notes': 'Notizen',
      'walk.price': 'Preis',
      'walk.submit': 'Anfrage Senden',
      'walk.pending': 'Ausstehend',
      'walk.accepted': 'Akzeptiert',
      'walk.inProgress': 'In Bearbeitung',
      'walk.completed': 'Abgeschlossen',
      'walk.cancelled': 'Storniert',
      
      // Subscription
      'subscription.plans': 'Abonnement-Pläne',
      'subscription.basic': 'Basis',
      'subscription.premium': 'Premium',
      'subscription.annual': 'Jährlich',
      'subscription.monthly': 'Monatlich',
      'subscription.yearly': 'Jährlich',
      'subscription.features': 'Funktionen',
      'subscription.subscribe': 'Abonnieren',
      'subscription.currentPlan': 'Aktueller Plan',
      'subscription.manage': 'Abonnement Verwalten',
      
      // Common
      'common.loading': 'Laden...',
      'common.error': 'Fehler',
      'common.success': 'Erfolg',
      'common.cancel': 'Abbrechen',
      'common.save': 'Speichern',
      'common.edit': 'Bearbeiten',
      'common.delete': 'Löschen',
      'common.confirm': 'Bestätigen',
      'common.back': 'Zurück',
      'common.next': 'Weiter',
      'common.previous': 'Vorherige',
      'common.close': 'Schließen',
      'common.yes': 'Ja',
      'common.no': 'Nein',
      'common.search': 'Suchen',
      'common.filter': 'Filtern',
      'common.sort': 'Sortieren',
      'common.refresh': 'Aktualisieren',
      'common.retry': 'Wiederholen',
      'common.tryAgain': 'Erneut Versuchen',
      'common.getStarted': 'Loslegen',
      
      // Time
      'time.monday': 'Montag',
      'time.tuesday': 'Dienstag',
      'time.wednesday': 'Mittwoch',
      'time.thursday': 'Donnerstag',
      'time.friday': 'Freitag',
      'time.saturday': 'Samstag',
      'time.sunday': 'Sonntag',
      
      // App Info
      'app.title': 'Paseo - Finden Sie den perfekten Gassi-Geher für Ihren Hund',
      'app.description': 'Verbinden Sie sich mit vertrauenswürdigen Gassi-Gehern in Ihrer Nähe',
      'app.tagline': 'Ihr Hund verdient die beste Pflege',
    }
  },
  es: {
    translation: {
      // Navigation
      'nav.home': 'Inicio',
      'nav.findWalker': 'Encontrar Paseador',
      'nav.messages': 'Mensajes',
      'nav.profile': 'Perfil',
      'nav.subscription': 'Suscripción',
      
      // Auth
      'auth.login': 'Iniciar Sesión',
      'auth.signup': 'Registrarse',
      'auth.logout': 'Cerrar Sesión',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.confirmPassword': 'Confirmar Contraseña',
      'auth.name': 'Nombre',
      'auth.phone': 'Teléfono',
      'auth.city': 'Ciudad',
      'auth.postalCode': 'Código Postal',
      'auth.userType': 'Tipo de Usuario',
      'auth.dogOwner': 'Soy dueño de un perro',
      'auth.wantToWalk': 'Quiero pasear perros',
      'auth.createAccount': 'Crear Cuenta',
      'auth.alreadyHaveAccount': '¿Ya tienes una cuenta? Inicia sesión aquí',
      'auth.welcome': '¡Bienvenido!',
      'auth.loginSuccess': 'Has iniciado sesión exitosamente.',
      'auth.accountCreated': '¡Cuenta creada!',
      'auth.accountCreatedSuccess': 'Tu cuenta ha sido creada exitosamente.',
      'auth.loginError': 'Error de inicio de sesión',
      'auth.signupError': 'Error al crear la cuenta',
      'auth.passwordsDontMatch': 'Las contraseñas no coinciden.',
      'auth.tryAgain': 'Por favor, inténtalo de nuevo.',
      'auth.rateLimitTitle': 'Límite de velocidad alcanzado',
      'auth.rateLimitMessage': 'Por seguridad, espera un momento antes de intentar de nuevo',
      'auth.emailExistsTitle': 'Email ya registrado',
      'auth.emailExistsMessage': 'Este email ya está registrado. Intenta iniciar sesión',
      'auth.confirmingEmail': 'Confirmando tu email...',
      'auth.pleaseWait': 'Por favor espera mientras verificamos tu dirección de email',
      'auth.emailConfirmed': '¡Email confirmado exitosamente!',
      'auth.welcomeToApp': '¡Bienvenido a Paseo! Ahora puedes acceder a todas las funciones',
      'auth.confirmationError': 'Error en la confirmación del email',
      'auth.emailExpired': 'El enlace de confirmación ha expirado. Solicita uno nuevo',
      'auth.accessDenied': 'Acceso denegado. Por favor intenta de nuevo',
      'auth.sessionError': 'Error al establecer la sesión. Intenta iniciar sesión',
      'auth.noSession': 'No se encontró una sesión válida. Por favor intenta de nuevo',
      'auth.redirectingHome': 'Redirigiendo a la página principal...',
      'auth.forgotPassword': '¿Olvidaste tu contraseña?',
      'auth.resetPassword': 'Restablecer Contraseña',
      'auth.sendResetLink': 'Enviar Enlace de Restablecimiento',
      'auth.resetPasswordSent': '¡Enlace de restablecimiento enviado!',
      'auth.checkEmailForReset': 'Revisa tu email para el enlace de restablecimiento de contraseña',
      'auth.resetPasswordError': 'Error al enviar enlace de restablecimiento',
      'auth.enterEmailFirst': 'Por favor ingresa tu dirección de email primero',
      'auth.validatingResetLink': 'Validando enlace de restablecimiento...',
      'auth.setNewPassword': 'Establecer Nueva Contraseña',
      'auth.enterNewPassword': 'Ingresa tu nueva contraseña a continuación',
      'auth.newPassword': 'Nueva Contraseña',
      'auth.confirmNewPassword': 'Confirmar Nueva Contraseña',
      'auth.updatePassword': 'Actualizar Contraseña',
      'auth.passwordUpdated': '¡Contraseña Actualizada!',
      'auth.passwordUpdatedSuccess': 'Tu contraseña ha sido actualizada exitosamente',
      'auth.passwordTooShort': 'La contraseña debe tener al menos 6 caracteres',
      'auth.noValidSession': 'No se encontró una sesión válida. Solicita un nuevo enlace de restablecimiento',
      
      // Dashboard
      'dashboard.welcome': 'Bienvenido a Paseo',
      'dashboard.findPerfectWalker': 'Encuentra el paseador perfecto para tu perro',
      'dashboard.myDogs': 'Mis Perros',
      'dashboard.addDog': 'Agregar Perro',
      'dashboard.upcomingWalks': 'Paseos Próximos',
      'dashboard.recentWalks': 'Paseos Recientes',
      'dashboard.findWalkers': 'Encontrar Paseadores',
      'dashboard.availableWalkers': 'Paseadores Disponibles',
      'dashboard.bookWalk': 'Reservar Paseo',
      'dashboard.viewProfile': 'Ver Perfil',
      
      // Dog Management
      'dog.addNew': 'Agregar Nuevo Perro',
      'dog.name': 'Nombre del Perro',
      'dog.age': 'Edad',
      'dog.breed': 'Raza',
      'dog.notes': 'Notas',
      'dog.image': 'Imagen',
      'dog.save': 'Guardar Perro',
      'dog.cancel': 'Cancelar',
      'dog.edit': 'Editar Perro',
      'dog.delete': 'Eliminar Perro',
      
      // Walker Profile
      'walker.bio': 'Biografía',
      'walker.experience': 'Experiencia',
      'walker.hourlyRate': 'Tarifa por Hora',
      'walker.availability': 'Disponibilidad',
      'walker.rating': 'Calificación',
      'walker.totalWalks': 'Total de Paseos',
      'walker.verified': 'Verificado',
      'walker.tags': 'Etiquetas',
      'walker.bookNow': 'Reservar Ahora',
      'walker.contact': 'Contactar',
      
      // Walk Requests
      'walk.requestWalk': 'Solicitar Paseo',
      'walk.selectDog': 'Seleccionar Perro',
      'walk.selectWalker': 'Seleccionar Paseador',
      'walk.serviceType': 'Tipo de Servicio',
      'walk.duration': 'Duración (minutos)',
      'walk.date': 'Fecha',
      'walk.time': 'Hora',
      'walk.location': 'Ubicación',
      'walk.notes': 'Notas',
      'walk.price': 'Precio',
      'walk.submit': 'Enviar Solicitud',
      'walk.pending': 'Pendiente',
      'walk.accepted': 'Aceptado',
      'walk.inProgress': 'En Progreso',
      'walk.completed': 'Completado',
      'walk.cancelled': 'Cancelado',
      
      // Subscription
      'subscription.plans': 'Planes de Suscripción',
      'subscription.basic': 'Básico',
      'subscription.premium': 'Premium',
      'subscription.annual': 'Anual',
      'subscription.monthly': 'Mensual',
      'subscription.yearly': 'Anual',
      'subscription.features': 'Características',
      'subscription.subscribe': 'Suscribirse',
      'subscription.currentPlan': 'Plan Actual',
      'subscription.manage': 'Gestionar Suscripción',
      
      // Common
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'common.success': 'Éxito',
      'common.cancel': 'Cancelar',
      'common.save': 'Guardar',
      'common.edit': 'Editar',
      'common.delete': 'Eliminar',
      'common.confirm': 'Confirmar',
      'common.back': 'Atrás',
      'common.next': 'Siguiente',
      'common.previous': 'Anterior',
      'common.close': 'Cerrar',
      'common.yes': 'Sí',
      'common.no': 'No',
      'common.search': 'Buscar',
      'common.filter': 'Filtrar',
      'common.sort': 'Ordenar',
      'common.refresh': 'Actualizar',
      'common.retry': 'Reintentar',
      'common.tryAgain': 'Intentar de Nuevo',
      'common.getStarted': 'Comenzar',
      
      // Time
      'time.monday': 'Lunes',
      'time.tuesday': 'Martes',
      'time.wednesday': 'Miércoles',
      'time.thursday': 'Jueves',
      'time.friday': 'Viernes',
      'time.saturday': 'Sábado',
      'time.sunday': 'Domingo',
      
      // App Info
      'app.title': 'Paseo - Encuentra el paseador perfecto para tu perro',
      'app.description': 'Conéctate con paseadores de perros de confianza en tu área',
      'app.tagline': 'Tu perro merece los mejores cuidados',
      
      // Home Page
      'home.heroTitle': 'Encuentra el paseador perfecto para tu perro',
      'home.heroSubtitle': 'Conéctate con paseadores de perros de confianza y experimentados en tu vecindario. Reserva paseos al instante y recibe actualizaciones en tiempo real.',
      'home.getStarted': 'Comenzar',
      'home.signIn': 'Iniciar Sesión',
      'home.verifiedWalkers': 'Paseadores Verificados',
      'home.support247': 'Soporte 24/7',
      'home.happyDogs': 'Perros Felices',
      'home.howItWorks': 'Cómo funciona',
      'home.howItWorksSubtitle': 'Pasos simples para darle a tu perro el cuidado que merece',
      'home.step1Title': 'Encuentra Paseadores',
      'home.step1Description': 'Explora paseadores verificados en tu área con calificaciones y reseñas.',
      'home.step2Title': 'Reserva un Paseo',
      'home.step2Description': 'Programa paseos a tu conveniencia con confirmación instantánea.',
      'home.step3Title': 'Mantente Informado',
      'home.step3Description': 'Recibe actualizaciones en tiempo real y fotos durante el paseo de tu perro.',
      'home.testimonialsTitle': 'Lo que dicen los dueños de mascotas',
      'home.luciaTestimonial': '¡Paseo ha sido increíble! Mi perro Max ama sus paseos con Manuel. La app es fácil de usar y recibo actualizaciones en cada paseo.',
      'home.manuelTestimonial': 'He estado paseando perros a través de Paseo por 2 años. La flexibilidad es perfecta y me encanta conocer nuevos perros.',
      'home.lucasTestimonial': '¡Bella siempre está emocionada cuando llega su paseador! El servicio es confiable y los paseadores son excelentes con los perros.',
      'home.verifiedWalkersCount': 'Paseadores Verificados',
      'home.citiesCount': 'Ciudades',
      'home.rating': 'Calificación',
      'home.readyToStart': '¿Listo para comenzar?',
      'home.readyToStartSubtitle': 'Únete a miles de dueños de mascotas que confían en Paseo para el cuidado de sus perros.',
      'home.startFreeToday': 'Comienza Gratis Hoy',
      'home.learnMore': 'Saber Más',
    }
  },
  pt: {
    translation: {
      // Navigation
      'nav.home': 'Início',
      'nav.findWalker': 'Encontrar Passeador',
      'nav.messages': 'Mensagens',
      'nav.profile': 'Perfil',
      'nav.subscription': 'Assinatura',
      
      // Auth
      'auth.login': 'Entrar',
      'auth.signup': 'Registrar',
      'auth.logout': 'Sair',
      'auth.email': 'E-mail',
      'auth.password': 'Senha',
      'auth.confirmPassword': 'Confirmar Senha',
      'auth.name': 'Nome',
      'auth.phone': 'Telefone',
      'auth.city': 'Cidade',
      'auth.postalCode': 'Código Postal',
      'auth.userType': 'Tipo de Usuário',
      'auth.dogOwner': 'Sou dono de cachorro',
      'auth.wantToWalk': 'Quero passear com cachorros',
      'auth.createAccount': 'Criar Conta',
      'auth.alreadyHaveAccount': 'Já tem uma conta? Faça login aqui',
      'auth.welcome': 'Bem-vindo!',
      'auth.loginSuccess': 'Você fez login com sucesso.',
      'auth.accountCreated': 'Conta criada!',
      'auth.accountCreatedSuccess': 'Sua conta foi criada com sucesso.',
      'auth.loginError': 'Erro de login',
      'auth.signupError': 'Erro ao criar conta',
      'auth.passwordsDontMatch': 'As senhas não coincidem.',
      'auth.tryAgain': 'Por favor, tente novamente.',
      'auth.rateLimitTitle': 'Limite de taxa atingido',
      'auth.rateLimitMessage': 'Por segurança, aguarde um momento antes de tentar novamente',
      'auth.emailExistsTitle': 'Email já registrado',
      'auth.emailExistsMessage': 'Este email já está registrado. Tente fazer login',
      
      // Dashboard
      'dashboard.welcome': 'Bem-vindo ao Paseo',
      'dashboard.findPerfectWalker': 'Encontre o passeador perfeito para seu cachorro',
      'dashboard.myDogs': 'Meus Cachorros',
      'dashboard.addDog': 'Adicionar Cachorro',
      'dashboard.upcomingWalks': 'Passeios Próximos',
      'dashboard.recentWalks': 'Passeios Recentes',
      'dashboard.findWalkers': 'Encontrar Passeadores',
      'dashboard.availableWalkers': 'Passeadores Disponíveis',
      'dashboard.bookWalk': 'Agendar Passeio',
      'dashboard.viewProfile': 'Ver Perfil',
      
      // Dog Management
      'dog.addNew': 'Adicionar Novo Cachorro',
      'dog.name': 'Nome do Cachorro',
      'dog.age': 'Idade',
      'dog.breed': 'Raça',
      'dog.notes': 'Notas',
      'dog.image': 'Imagem',
      'dog.save': 'Salvar Cachorro',
      'dog.cancel': 'Cancelar',
      'dog.edit': 'Editar Cachorro',
      'dog.delete': 'Excluir Cachorro',
      
      // Walker Profile
      'walker.bio': 'Biografia',
      'walker.experience': 'Experiência',
      'walker.hourlyRate': 'Taxa por Hora',
      'walker.availability': 'Disponibilidade',
      'walker.rating': 'Avaliação',
      'walker.totalWalks': 'Total de Passeios',
      'walker.verified': 'Verificado',
      'walker.tags': 'Tags',
      'walker.bookNow': 'Agendar Agora',
      'walker.contact': 'Contatar',
      
      // Walk Requests
      'walk.requestWalk': 'Solicitar Passeio',
      'walk.selectDog': 'Selecionar Cachorro',
      'walk.selectWalker': 'Selecionar Passeador',
      'walk.serviceType': 'Tipo de Serviço',
      'walk.duration': 'Duração (minutos)',
      'walk.date': 'Data',
      'walk.time': 'Hora',
      'walk.location': 'Local',
      'walk.notes': 'Notas',
      'walk.price': 'Preço',
      'walk.submit': 'Enviar Solicitação',
      'walk.pending': 'Pendente',
      'walk.accepted': 'Aceito',
      'walk.inProgress': 'Em Andamento',
      'walk.completed': 'Concluído',
      'walk.cancelled': 'Cancelado',
      
      // Subscription
      'subscription.plans': 'Planos de Assinatura',
      'subscription.basic': 'Básico',
      'subscription.premium': 'Premium',
      'subscription.annual': 'Anual',
      'subscription.monthly': 'Mensal',
      'subscription.yearly': 'Anual',
      'subscription.features': 'Recursos',
      'subscription.subscribe': 'Assinar',
      'subscription.currentPlan': 'Plano Atual',
      'subscription.manage': 'Gerenciar Assinatura',
      
      // Common
      'common.loading': 'Carregando...',
      'common.error': 'Erro',
      'common.success': 'Sucesso',
      'common.cancel': 'Cancelar',
      'common.save': 'Salvar',
      'common.edit': 'Editar',
      'common.delete': 'Excluir',
      'common.confirm': 'Confirmar',
      'common.back': 'Voltar',
      'common.next': 'Próximo',
      'common.previous': 'Anterior',
      'common.close': 'Fechar',
      'common.yes': 'Sim',
      'common.no': 'Não',
      'common.search': 'Pesquisar',
      'common.filter': 'Filtrar',
      'common.sort': 'Ordenar',
      'common.refresh': 'Atualizar',
      'common.retry': 'Tentar Novamente',
      'common.tryAgain': 'Tentar Novamente',
      'common.getStarted': 'Começar',
      
      // Time
      'time.monday': 'Segunda-feira',
      'time.tuesday': 'Terça-feira',
      'time.wednesday': 'Quarta-feira',
      'time.thursday': 'Quinta-feira',
      'time.friday': 'Sexta-feira',
      'time.saturday': 'Sábado',
      'time.sunday': 'Domingo',
      
      // App Info
      'app.title': 'Paseo - Encontre o passeador perfeito para seu cachorro',
      'app.description': 'Conecte-se com passeadores de cachorros confiáveis em sua área',
      'app.tagline': 'Seu cachorro merece os melhores cuidados',
    }
  },
  it: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.findWalker': 'Trova Dog Sitter',
      'nav.messages': 'Messaggi',
      'nav.profile': 'Profilo',
      'nav.subscription': 'Abbonamento',
      
      // Auth
      'auth.login': 'Accedi',
      'auth.signup': 'Registrati',
      'auth.logout': 'Esci',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Conferma Password',
      'auth.name': 'Nome',
      'auth.phone': 'Telefono',
      'auth.city': 'Città',
      'auth.postalCode': 'Codice Postale',
      'auth.userType': 'Tipo di Utente',
      'auth.dogOwner': 'Sono proprietario di un cane',
      'auth.wantToWalk': 'Voglio portare a spasso i cani',
      'auth.createAccount': 'Crea Account',
      'auth.alreadyHaveAccount': 'Hai già un account? Accedi qui',
      'auth.welcome': 'Benvenuto!',
      'auth.loginSuccess': 'Hai effettuato l\'accesso con successo.',
      'auth.accountCreated': 'Account creato!',
      'auth.accountCreatedSuccess': 'Il tuo account è stato creato con successo.',
      'auth.loginError': 'Errore di accesso',
      'auth.signupError': 'Errore nella creazione dell\'account',
      'auth.passwordsDontMatch': 'Le password non corrispondono.',
      'auth.tryAgain': 'Riprova.',
      'auth.rateLimitTitle': 'Limite di velocità raggiunto',
      'auth.rateLimitMessage': 'Per motivi di sicurezza, attendi un momento prima di riprovare',
      'auth.emailExistsTitle': 'Email già registrata',
      'auth.emailExistsMessage': 'Questa email è già registrata. Prova ad accedere',
      
      // Dashboard
      'dashboard.welcome': 'Benvenuto in Paseo',
      'dashboard.findPerfectWalker': 'Trova il dog sitter perfetto per il tuo cane',
      'dashboard.myDogs': 'I Miei Cani',
      'dashboard.addDog': 'Aggiungi Cane',
      'dashboard.upcomingWalks': 'Passeggiate Imminenti',
      'dashboard.recentWalks': 'Passeggiate Recenti',
      'dashboard.findWalkers': 'Trova Dog Sitter',
      'dashboard.availableWalkers': 'Dog Sitter Disponibili',
      'dashboard.bookWalk': 'Prenota Passeggiata',
      'dashboard.viewProfile': 'Visualizza Profilo',
      
      // Dog Management
      'dog.addNew': 'Aggiungi Nuovo Cane',
      'dog.name': 'Nome del Cane',
      'dog.age': 'Età',
      'dog.breed': 'Razza',
      'dog.notes': 'Note',
      'dog.image': 'Immagine',
      'dog.save': 'Salva Cane',
      'dog.cancel': 'Annulla',
      'dog.edit': 'Modifica Cane',
      'dog.delete': 'Elimina Cane',
      
      // Walker Profile
      'walker.bio': 'Biografia',
      'walker.experience': 'Esperienza',
      'walker.hourlyRate': 'Tariffa Oraria',
      'walker.availability': 'Disponibilità',
      'walker.rating': 'Valutazione',
      'walker.totalWalks': 'Totale Passeggiate',
      'walker.verified': 'Verificato',
      'walker.tags': 'Tag',
      'walker.bookNow': 'Prenota Ora',
      'walker.contact': 'Contatta',
      
      // Walk Requests
      'walk.requestWalk': 'Richiedi Passeggiata',
      'walk.selectDog': 'Seleziona Cane',
      'walk.selectWalker': 'Seleziona Dog Sitter',
      'walk.serviceType': 'Tipo di Servizio',
      'walk.duration': 'Durata (minuti)',
      'walk.date': 'Data',
      'walk.time': 'Ora',
      'walk.location': 'Posizione',
      'walk.notes': 'Note',
      'walk.price': 'Prezzo',
      'walk.submit': 'Invia Richiesta',
      'walk.pending': 'In Attesa',
      'walk.accepted': 'Accettato',
      'walk.inProgress': 'In Corso',
      'walk.completed': 'Completato',
      'walk.cancelled': 'Annullato',
      
      // Subscription
      'subscription.plans': 'Piani di Abbonamento',
      'subscription.basic': 'Base',
      'subscription.premium': 'Premium',
      'subscription.annual': 'Annuale',
      'subscription.monthly': 'Mensile',
      'subscription.yearly': 'Annuale',
      'subscription.features': 'Caratteristiche',
      'subscription.subscribe': 'Abbonati',
      'subscription.currentPlan': 'Piano Attuale',
      'subscription.manage': 'Gestisci Abbonamento',
      
      // Common
      'common.loading': 'Caricamento...',
      'common.error': 'Errore',
      'common.success': 'Successo',
      'common.cancel': 'Annulla',
      'common.save': 'Salva',
      'common.edit': 'Modifica',
      'common.delete': 'Elimina',
      'common.confirm': 'Conferma',
      'common.back': 'Indietro',
      'common.next': 'Avanti',
      'common.previous': 'Precedente',
      'common.close': 'Chiudi',
      'common.yes': 'Sì',
      'common.no': 'No',
      'common.search': 'Cerca',
      'common.filter': 'Filtra',
      'common.sort': 'Ordina',
      'common.refresh': 'Aggiorna',
      'common.retry': 'Riprova',
      'common.tryAgain': 'Riprova',
      'common.getStarted': 'Inizia',
      
      // Time
      'time.monday': 'Lunedì',
      'time.tuesday': 'Martedì',
      'time.wednesday': 'Mercoledì',
      'time.thursday': 'Giovedì',
      'time.friday': 'Venerdì',
      'time.saturday': 'Sabato',
      'time.sunday': 'Domenica',
      
      // App Info
      'app.title': 'Paseo - Trova il dog sitter perfetto per il tuo cane',
      'app.description': 'Connettiti con dog sitter affidabili nella tua zona',
      'app.tagline': 'Il tuo cane merita le migliori cure',
    }
  },
  ru: {
    translation: {
      // Navigation
      'nav.home': 'Главная',
      'nav.findWalker': 'Найти Выгульщика',
      'nav.messages': 'Сообщения',
      'nav.profile': 'Профиль',
      'nav.subscription': 'Подписка',
      
      // Auth
      'auth.login': 'Войти',
      'auth.signup': 'Регистрация',
      'auth.logout': 'Выйти',
      'auth.email': 'Электронная почта',
      'auth.password': 'Пароль',
      'auth.confirmPassword': 'Подтвердить пароль',
      'auth.name': 'Имя',
      'auth.phone': 'Телефон',
      'auth.city': 'Город',
      'auth.postalCode': 'Почтовый индекс',
      'auth.userType': 'Тип пользователя',
      'auth.dogOwner': 'Я владелец собаки',
      'auth.wantToWalk': 'Я хочу выгуливать собак',
      'auth.createAccount': 'Создать аккаунт',
      'auth.alreadyHaveAccount': 'Уже есть аккаунт? Войти здесь',
      'auth.welcome': 'Добро пожаловать!',
      'auth.loginSuccess': 'Вы успешно вошли в систему.',
      'auth.accountCreated': 'Аккаунт создан!',
      'auth.accountCreatedSuccess': 'Ваш аккаунт был успешно создан.',
      'auth.loginError': 'Ошибка входа',
      'auth.signupError': 'Ошибка создания аккаунта',
      'auth.passwordsDontMatch': 'Пароли не совпадают.',
      'auth.tryAgain': 'Попробуйте еще раз.',
      'auth.rateLimitTitle': 'Достигнут лимит скорости',
      'auth.rateLimitMessage': 'В целях безопасности, подождите немного перед повторной попыткой',
      'auth.emailExistsTitle': 'Email уже зарегистрирован',
      'auth.emailExistsMessage': 'Этот email уже зарегистрирован. Попробуйте войти',
      
      // Dashboard
      'dashboard.welcome': 'Добро пожаловать в Paseo',
      'dashboard.findPerfectWalker': 'Найдите идеального выгульщика для вашей собаки',
      'dashboard.myDogs': 'Мои Собаки',
      'dashboard.addDog': 'Добавить Собаку',
      'dashboard.upcomingWalks': 'Предстоящие Прогулки',
      'dashboard.recentWalks': 'Недавние Прогулки',
      'dashboard.findWalkers': 'Найти Выгульщиков',
      'dashboard.availableWalkers': 'Доступные Выгульщики',
      'dashboard.bookWalk': 'Забронировать Прогулку',
      'dashboard.viewProfile': 'Посмотреть Профиль',
      
      // Dog Management
      'dog.addNew': 'Добавить Новую Собаку',
      'dog.name': 'Имя Собаки',
      'dog.age': 'Возраст',
      'dog.breed': 'Порода',
      'dog.notes': 'Заметки',
      'dog.image': 'Изображение',
      'dog.save': 'Сохранить Собаку',
      'dog.cancel': 'Отмена',
      'dog.edit': 'Редактировать Собаку',
      'dog.delete': 'Удалить Собаку',
      
      // Walker Profile
      'walker.bio': 'Биография',
      'walker.experience': 'Опыт',
      'walker.hourlyRate': 'Почасовая Ставка',
      'walker.availability': 'Доступность',
      'walker.rating': 'Рейтинг',
      'walker.totalWalks': 'Всего Прогулок',
      'walker.verified': 'Проверен',
      'walker.tags': 'Теги',
      'walker.bookNow': 'Забронировать Сейчас',
      'walker.contact': 'Связаться',
      
      // Walk Requests
      'walk.requestWalk': 'Запросить Прогулку',
      'walk.selectDog': 'Выбрать Собаку',
      'walk.selectWalker': 'Выбрать Выгульщика',
      'walk.serviceType': 'Тип Услуги',
      'walk.duration': 'Длительность (минуты)',
      'walk.date': 'Дата',
      'walk.time': 'Время',
      'walk.location': 'Местоположение',
      'walk.notes': 'Заметки',
      'walk.price': 'Цена',
      'walk.submit': 'Отправить Запрос',
      'walk.pending': 'В Ожидании',
      'walk.accepted': 'Принято',
      'walk.inProgress': 'В Процессе',
      'walk.completed': 'Завершено',
      'walk.cancelled': 'Отменено',
      
      // Subscription
      'subscription.plans': 'Планы Подписки',
      'subscription.basic': 'Базовый',
      'subscription.premium': 'Премиум',
      'subscription.annual': 'Годовой',
      'subscription.monthly': 'Месячный',
      'subscription.yearly': 'Годовой',
      'subscription.features': 'Функции',
      'subscription.subscribe': 'Подписаться',
      'subscription.currentPlan': 'Текущий План',
      'subscription.manage': 'Управлять Подпиской',
      
      // Common
      'common.loading': 'Загрузка...',
      'common.error': 'Ошибка',
      'common.success': 'Успех',
      'common.cancel': 'Отмена',
      'common.save': 'Сохранить',
      'common.edit': 'Редактировать',
      'common.delete': 'Удалить',
      'common.confirm': 'Подтвердить',
      'common.back': 'Назад',
      'common.next': 'Далее',
      'common.previous': 'Предыдущий',
      'common.close': 'Закрыть',
      'common.yes': 'Да',
      'common.no': 'Нет',
      'common.search': 'Поиск',
      'common.filter': 'Фильтр',
      'common.sort': 'Сортировать',
      'common.refresh': 'Обновить',
      'common.retry': 'Повторить',
      'common.tryAgain': 'Попробовать Снова',
      'common.getStarted': 'Начать',
      
      // Time
      'time.monday': 'Понедельник',
      'time.tuesday': 'Вторник',
      'time.wednesday': 'Среда',
      'time.thursday': 'Четверг',
      'time.friday': 'Пятница',
      'time.saturday': 'Суббота',
      'time.sunday': 'Воскресенье',
      
      // App Info
      'app.title': 'Paseo - Найдите идеального выгульщика для вашей собаки',
      'app.description': 'Подключитесь к надежным выгульщикам собак в вашем районе',
      'app.tagline': 'Ваша собака заслуживает лучшего ухода',
    }
  },
  pl: {
    translation: {
      // Navigation
      'nav.home': 'Strona Główna',
      'nav.findWalker': 'Znajdź Opiekuna',
      'nav.messages': 'Wiadomości',
      'nav.profile': 'Profil',
      'nav.subscription': 'Subskrypcja',
      
      // Auth
      'auth.login': 'Zaloguj się',
      'auth.signup': 'Zarejestruj się',
      'auth.logout': 'Wyloguj się',
      'auth.email': 'E-mail',
      'auth.password': 'Hasło',
      'auth.confirmPassword': 'Potwierdź Hasło',
      'auth.name': 'Imię',
      'auth.phone': 'Telefon',
      'auth.city': 'Miasto',
      'auth.postalCode': 'Kod Pocztowy',
      'auth.userType': 'Typ Użytkownika',
      'auth.dogOwner': 'Jestem właścicielem psa',
      'auth.wantToWalk': 'Chcę wyprowadzać psy',
      'auth.createAccount': 'Utwórz Konto',
      'auth.alreadyHaveAccount': 'Masz już konto? Zaloguj się tutaj',
      'auth.welcome': 'Witamy!',
      'auth.loginSuccess': 'Zalogowałeś się pomyślnie.',
      'auth.accountCreated': 'Konto utworzone!',
      'auth.accountCreatedSuccess': 'Twoje konto zostało pomyślnie utworzone.',
      'auth.loginError': 'Błąd logowania',
      'auth.signupError': 'Błąd tworzenia konta',
      'auth.passwordsDontMatch': 'Hasła nie pasują.',
      'auth.tryAgain': 'Spróbuj ponownie.',
      'auth.rateLimitTitle': 'Osiągnięto limit szybkości',
      'auth.rateLimitMessage': 'Ze względów bezpieczeństwa, poczekaj chwilę przed ponowną próbą',
      'auth.emailExistsTitle': 'Email już zarejestrowany',
      'auth.emailExistsMessage': 'Ten email jest już zarejestrowany. Spróbuj się zalogować',
      
      // Dashboard
      'dashboard.welcome': 'Witamy w Paseo',
      'dashboard.findPerfectWalker': 'Znajdź idealnego opiekuna dla swojego psa',
      'dashboard.myDogs': 'Moje Psy',
      'dashboard.addDog': 'Dodaj Psa',
      'dashboard.upcomingWalks': 'Nadchodzące Spacery',
      'dashboard.recentWalks': 'Ostatnie Spacery',
      'dashboard.findWalkers': 'Znajdź Opiekunów',
      'dashboard.availableWalkers': 'Dostępni Opiekunowie',
      'dashboard.bookWalk': 'Zarezerwuj Spacer',
      'dashboard.viewProfile': 'Zobacz Profil',
      
      // Dog Management
      'dog.addNew': 'Dodaj Nowego Psa',
      'dog.name': 'Imię Psa',
      'dog.age': 'Wiek',
      'dog.breed': 'Rasa',
      'dog.notes': 'Notatki',
      'dog.image': 'Zdjęcie',
      'dog.save': 'Zapisz Psa',
      'dog.cancel': 'Anuluj',
      'dog.edit': 'Edytuj Psa',
      'dog.delete': 'Usuń Psa',
      
      // Walker Profile
      'walker.bio': 'Biografia',
      'walker.experience': 'Doświadczenie',
      'walker.hourlyRate': 'Stawka Godzinowa',
      'walker.availability': 'Dostępność',
      'walker.rating': 'Ocena',
      'walker.totalWalks': 'Całkowite Spacery',
      'walker.verified': 'Zweryfikowany',
      'walker.tags': 'Tagi',
      'walker.bookNow': 'Zarezerwuj Teraz',
      'walker.contact': 'Kontakt',
      
      // Walk Requests
      'walk.requestWalk': 'Zażądaj Spaceru',
      'walk.selectDog': 'Wybierz Psa',
      'walk.selectWalker': 'Wybierz Opiekuna',
      'walk.serviceType': 'Typ Usługi',
      'walk.duration': 'Czas Trwania (minuty)',
      'walk.date': 'Data',
      'walk.time': 'Godzina',
      'walk.location': 'Lokalizacja',
      'walk.notes': 'Notatki',
      'walk.price': 'Cena',
      'walk.submit': 'Wyślij Prośbę',
      'walk.pending': 'Oczekujące',
      'walk.accepted': 'Zaakceptowane',
      'walk.inProgress': 'W Trakcie',
      'walk.completed': 'Zakończone',
      'walk.cancelled': 'Anulowane',
      
      // Subscription
      'subscription.plans': 'Plany Subskrypcji',
      'subscription.basic': 'Podstawowy',
      'subscription.premium': 'Premium',
      'subscription.annual': 'Roczny',
      'subscription.monthly': 'Miesięczny',
      'subscription.yearly': 'Roczny',
      'subscription.features': 'Funkcje',
      'subscription.subscribe': 'Subskrybuj',
      'subscription.currentPlan': 'Aktualny Plan',
      'subscription.manage': 'Zarządzaj Subskrypcją',
      
      // Common
      'common.loading': 'Ładowanie...',
      'common.error': 'Błąd',
      'common.success': 'Sukces',
      'common.cancel': 'Anuluj',
      'common.save': 'Zapisz',
      'common.edit': 'Edytuj',
      'common.delete': 'Usuń',
      'common.confirm': 'Potwierdź',
      'common.back': 'Wstecz',
      'common.next': 'Dalej',
      'common.previous': 'Poprzedni',
      'common.close': 'Zamknij',
      'common.yes': 'Tak',
      'common.no': 'Nie',
      'common.search': 'Szukaj',
      'common.filter': 'Filtruj',
      'common.sort': 'Sortuj',
      'common.refresh': 'Odśwież',
      'common.retry': 'Spróbuj Ponownie',
      'common.tryAgain': 'Spróbuj Ponownie',
      'common.getStarted': 'Zacznij',
      
      // Time
      'time.monday': 'Poniedziałek',
      'time.tuesday': 'Wtorek',
      'time.wednesday': 'Środa',
      'time.thursday': 'Czwartek',
      'time.friday': 'Piątek',
      'time.saturday': 'Sobota',
      'time.sunday': 'Niedziela',
      
      // App Info
      'app.title': 'Paseo - Znajdź idealnego opiekuna dla swojego psa',
      'app.description': 'Połącz się z zaufanymi opiekunami psów w Twojej okolicy',
      'app.tagline': 'Twój pies zasługuje na najlepszą opiekę',
    }
  }
};

// Enhanced language detection based on location and browser
const detectLanguageFromLocation = () => {
  // Try multiple methods to detect user's location and language
  let detectedLanguage = 'en'; // Default fallback
  
  // Method 1: Try to get country from browser locale
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const country = locale.split('-')[1];
    
    if (country) {
  const countryLanguageMap: { [key: string]: string } = {
        // Existing languages
        'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en',
        'FR': 'fr', 'BE': 'fr', // France, Belgium
        'DE': 'de', 'AT': 'de', 'LU': 'de', 'LI': 'de', // German-speaking countries
        'CH': 'de', // Switzerland (German as default)
        
        // New languages - Spain and others
        'ES': 'es', // Spain - Spanish
        'PT': 'pt', // Portugal - Portuguese
        'IT': 'it', // Italy - Italian
        'RU': 'ru', // Russia - Russian
        'PL': 'pl', // Poland - Polish
        
        // Additional countries
        'NL': 'nl', // Netherlands - Dutch
        'SE': 'sv', // Sweden - Swedish
        'NO': 'no', // Norway - Norwegian
        'DK': 'da', // Denmark - Danish
        'FI': 'fi', // Finland - Finnish
        'BR': 'pt', // Brazil - Portuguese
        'MX': 'es', // Mexico - Spanish
        'AR': 'es', // Argentina - Spanish
        'CL': 'es', // Chile - Spanish
        'CO': 'es', // Colombia - Spanish
        'PE': 'es', // Peru - Spanish
        'VE': 'es', // Venezuela - Spanish
        'UA': 'uk', // Ukraine - Ukrainian
        'CZ': 'cs', // Czech Republic - Czech
        'SK': 'sk', // Slovakia - Slovak
        'HU': 'hu', // Hungary - Hungarian
        'RO': 'ro', // Romania - Romanian
        'BG': 'bg', // Bulgaria - Bulgarian
        'HR': 'hr', // Croatia - Croatian
        'SI': 'sl', // Slovenia - Slovenian
        'EE': 'et', // Estonia - Estonian
        'LV': 'lv', // Latvia - Latvian
        'LT': 'lt', // Lithuania - Lithuanian
      };
      
      detectedLanguage = countryLanguageMap[country] || detectedLanguage;
    }
  } catch (error) {
    console.log('Error detecting country from locale:', error);
  }
  
  // Method 2: Try to get language from browser
  try {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang) {
      const langCode = browserLang.split('-')[0];
      // If we have a supported language from browser, use it
      const supportedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'ru', 'pl', 'nl', 'sv', 'no', 'da', 'fi', 'uk', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'et', 'lv', 'lt'];
      if (supportedLanguages.includes(langCode)) {
        detectedLanguage = langCode;
      }
    }
  } catch (error) {
    console.log('Error detecting browser language:', error);
  }
  
  // Method 3: Try geolocation API (if available and user allows)
  // This would require user permission, so we'll skip for now
  
  console.log('Detected language:', detectedLanguage);
  return detectedLanguage;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: detectLanguageFromLocation(),
    
    detection: {
      order: ['localStorage', 'path', 'htmlTag', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      checkWhitelist: true,
    },
    
    supportedLngs: ['en', 'fr', 'de', 'es', 'pt', 'it', 'ru', 'pl'],
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
