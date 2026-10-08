import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { statsAPI } from '@/services/endpoints';
import { contactSchema, type ContactInput } from '@shared/types';
import toast from 'react-hot-toast';

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactInput>({
        resolver: zodResolver(contactSchema as any),
    });

    const onSubmit = async (data: ContactInput) => {
        setLoading(true);
        try {
            await statsAPI.submitContact(data);
            setSubmitted(true);
            reset();
            toast.success('Your message has been sent successfully!');
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-4">
            <div className="container-max max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-muted-foreground">Have questions? We'd love to hear from you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:flex-col md:space-y-6 md:overflow-visible md:pb-0 md:snap-none">
                        {[
                            { icon: Mail, title: 'Email', info: 'support@learnhub.com', sub: 'Within 24 hours' },
                            { icon: Phone, title: 'Phone', info: '+91 98765 43210', sub: '9am-6pm IST' },
                            { icon: MapPin, title: 'Office', info: 'Bangalore, India', sub: 'Visit us anytime' },
                        ].map((item, i) => (
                            <Card key={i} className="p-3 sm:p-4 min-w-[200px] flex-shrink-0 snap-start">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-xs sm:text-sm">{item.title}</h3>
                                        <p className="text-xs sm:text-sm truncate">{item.info}</p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.sub}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardContent className="p-6">
                                {submitted ? (
                                    <div className="text-center py-12">
                                        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                                        <h2 className="font-heading text-2xl font-bold mb-2">Message Sent!</h2>
                                        <p className="text-muted-foreground mb-6">We'll get back to you within 24 hours.</p>
                                        <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another Message</Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium mb-1.5 block">Name</label>
                                                <Input placeholder="Your name" {...register('name')} />
                                                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1.5 block">Email</label>
                                                <Input placeholder="you@example.com" {...register('email')} />
                                                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">Subject</label>
                                            <Input placeholder="How can we help?" {...register('subject')} />
                                            {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">Message</label>
                                            <textarea
                                                className="w-full min-h-[120px] rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                placeholder="Tell us more..."
                                                {...register('message')}
                                            />
                                            {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
                                        </div>
                                        <Button type="submit" size="lg" disabled={loading}>
                                            {loading ? 'Sending...' : 'Send Message'}
                                            {!loading && <Send className="ml-2 h-4 w-4" />}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}