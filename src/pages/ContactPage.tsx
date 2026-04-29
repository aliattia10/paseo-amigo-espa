import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    // In a real app, you'd send this to an API
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-medium-jungle transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Have questions or need help? We're here for you and your pets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-medium-jungle/10 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-medium-jungle" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">info@petflik.com</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Use this address for refunds, disputes, and account deletion support.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-medium-jungle/10 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-medium-jungle" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Phone</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">+34 (0) 123 456 789</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-medium-jungle/10 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-medium-jungle" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Office</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Europe</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Card className="shadow-xl border-none">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What is this about?" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="How can we help you?" className="min-h-[150px]" required />
                  </div>
                  <Button type="submit" className="w-full bg-medium-jungle hover:bg-medium-jungle/90 text-white">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

