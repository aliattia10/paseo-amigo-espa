import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Shield, Clock, Users, CheckCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/ui/language-selector';

const Index = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
        {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-semibold text-neutral-text">Paseo</span>
            </div>
          <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-text leading-tight">
                {t('home.heroTitle')}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('home.heroSubtitle')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-base px-8 py-3 bg-primary hover:bg-primary/90 text-white"
                onClick={handleGetStarted}
              >
                {currentUser ? t('nav.dashboard') : t('home.getStarted')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              {!currentUser && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base px-8 py-3"
                  onClick={() => navigate('/auth')}
                >
                  {t('home.signIn')}
                </Button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>{t('home.verifiedWalkers')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{t('home.support247')}</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src="/lucas-dog.jpg" 
                alt="Happy dog" 
                className="w-full h-[400px] object-cover"
              />
            </div>
            {/* Stats card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-neutral-text">10,000+</div>
                  <div className="text-xs text-muted-foreground">{t('home.happyDogs')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-text mb-4">
              {t('home.howItWorks')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-semibold">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-neutral-text">{t('home.step1Title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.step1Description')}
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-semibold">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-neutral-text">{t('home.step2Title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.step2Description')}
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-semibold">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-neutral-text">{t('home.step3Title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.step3Description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-text mb-4">
              {t('home.testimonialsTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="/lucia-profile.jpg" 
                    alt="Lucia" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-neutral-text">Lucia M.</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "{t('home.luciaTestimonial')}"
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="/manuel-profile.jpg" 
                    alt="Manuel" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                <div>
                    <div className="font-medium text-neutral-text">Manuel R.</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "{t('home.manuelTestimonial')}"
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="/lucas-dog.jpg" 
                    alt="Lucas" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-neutral-text">Lucas & Bella</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "{t('home.lucasTestimonial')}"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">10,000+</div>
              <div className="text-sm text-muted-foreground">{t('home.happyDogs')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">500+</div>
              <div className="text-sm text-muted-foreground">{t('home.verifiedWalkersCount')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">{t('home.citiesCount')}</div>
              </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">4.9★</div>
              <div className="text-sm text-muted-foreground">{t('home.rating')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-neutral-text mb-4">
            {t('home.readyToStart')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('home.readyToStartSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-base px-8 py-3 bg-primary hover:bg-primary/90 text-white"
              onClick={handleGetStarted}
            >
              {currentUser ? t('nav.dashboard') : t('home.startFreeToday')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            {!currentUser && (
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base px-8 py-3"
                onClick={() => navigate('/auth')}
              >
                {t('home.learnMore')}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;