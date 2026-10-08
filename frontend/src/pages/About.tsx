import { Target, Users, Award, Heart, Code, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
    return (
        <div>
            {/* Hero */}
            <section className="section-padding bg-muted/30">
                <div className="container-max text-center max-w-3xl">
                    <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6">
                        About <span className="gradient-text">LearnHub</span>
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        We're on a mission to make quality computer science education accessible to everyone.
                        Founded in 2024, LearnHub has grown to become a trusted platform for learners worldwide.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="section-padding">
                <div className="container-max">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-heading text-3xl font-bold mb-4">Our Mission</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We believe every person deserves access to world-class education. Our platform connects
                                industry experts with passionate learners, creating an ecosystem where knowledge flows freely
                                and skills are built practically.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Every course is crafted with real-world applicability in mind — not just theory, but the
                                exact skills that top companies look for.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Target, title: 'Goal-Oriented', desc: 'Every course targets specific career outcomes' },
                                { icon: Users, title: 'Community', desc: 'Learn with thousands of peers worldwide' },
                                { icon: Award, title: 'Quality', desc: 'Industry experts review all content' },
                                { icon: Heart, title: 'Passion', desc: 'Built by educators who love teaching' },
                            ].map((item, i) => (
                                <Card key={i} className="p-4 text-center">
                                    <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section-padding bg-muted/30">
                <div className="container-max">
                    <h2 className="font-heading text-3xl font-bold text-center mb-12">What Drives Us</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Code, title: 'Practical Skills', desc: 'Our courses focus on hands-on projects and real-world scenarios, ensuring you can apply what you learn immediately.' },
                            { icon: Globe, title: 'Global Access', desc: 'Learn from anywhere, at any pace. Our platform is designed for accessibility across devices and geographies.' },
                            { icon: Award, title: 'Industry Standards', desc: 'Curriculum aligned with industry requirements, reviewed by professionals working at top tech companies.' },
                        ].map((item, i) => (
                            <Card key={i} className="p-8 text-center border-0 shadow-none bg-transparent">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                                    <item.icon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}