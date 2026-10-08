import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Github, Twitter, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-muted/50 border-top pt-10 pl-10">
            <div className="container-max pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-heading font-bold text-xl">
                                Learn<span className="text-primary">Hub</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Master computer science with expert-led courses. From programming to AI, we've got your learning journey covered.
                        </p>
                        <div className="flex gap-3">
                            {[Github, Twitter, Linkedin, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links + Categories — single row on mobile */}
                    <div className="grid grid-cols-2 gap-8 md:contents">
                        <div>
                            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                {['Courses', 'Blog', 'About', 'Contact', 'Careers'].map((link) => (
                                    <li key={link}>
                                        <Link to={`/${link.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-heading font-semibold mb-4">Categories</h4>
                            <ul className="space-y-2">
                                {['Web Development', 'Data Science', 'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'Machine Learning'].map((cat) => (
                                    <li key={cat}>
                                        <Link to={`/courses?category=${cat.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            {cat}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-heading font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 mt-0.5 text-primary" />
                                support@learnhub.com
                            </li>
                            <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 mt-0.5 text-primary" />
                                +91 98765 43210
                            </li>
                            <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                                Bangalore, India
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} LearnHub. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
                        <Link to="/refund" className="text-sm text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}