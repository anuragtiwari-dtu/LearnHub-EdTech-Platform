import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Users, Award, Clock, Play, Star, CheckCircle, Zap, Target, TrendingUp, Code2, Sparkles, Atom, Server, Terminal, Cloud, Box, FileCode, Database, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { courseAPI, statsAPI } from '@/services/endpoints';
import { formatPrice, calculateDiscount, formatDuration, getLevelColor } from '@/lib/utils';
import { useEffect, useState } from "react";
import { useAuthStore } from '@/store/authStore';

const words = ["Coding", "Winning"];

function useTypewriter() {
    const [text, setText] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[wordIndex];
        let timeout: NodeJS.Timeout;

        if (!isDeleting) {
            // typing
            timeout = setTimeout(() => {
                setText(currentWord.slice(0, text.length + 1));
            }, 120);
        } else {
            // deleting
            timeout = setTimeout(() => {
                setText(currentWord.slice(0, text.length - 1));
            }, 60);
        }

        // when word fully typed
        if (text === currentWord && !isDeleting) {
            timeout = setTimeout(() => setIsDeleting(true), 1000);
        }

        // when fully deleted
        if (text === "" && isDeleting) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
        }

        return () => clearTimeout(timeout);
    }, [text, isDeleting, wordIndex]);

    return text;
}

function CourseCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
        </Card>
    );
}

export default function Home() {
    const { data: coursesData, isLoading: coursesLoading } = useQuery({
        queryKey: ['featured-courses'],
        queryFn: courseAPI.getFeatured,
    });

    const { data: statsData } = useQuery({
        queryKey: ['public-stats'],
        queryFn: statsAPI.getPublicStats,
    });

    const stats = statsData?.data;
    const courses = coursesData?.data || [];

    const { isAuthenticated } = useAuthStore();
    const animatedWord = useTypewriter();

    return (
        <div>
            <section className="relative overflow-hidden bg-background py-10 md:py-14 lg:py-17">

                {/* Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

                {/* Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl opacity-50 animate-pulse delay-1000" />

                <div className="container mx-auto px-4 relative">

                    {/* 🔥 ONE parent wrapper */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        {/* ✅ LEFT: Content */}
                        <div className="text-center lg:text-left">

                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                                <Sparkles className="h-4 w-4" />
                                <span>Start Your Learning Journey Today</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                                Master <span className="text-primary">Programming</span>
                                <br />
                                From Zero to Hero
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                                Learn to code with industry experts. Access 100+ courses in web development,
                                data science, AI, and more.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to={isAuthenticated ? "/courses" : "/login"}>
                                    <Button size="lg">
                                        Start {animatedWord}
                                        <span className="ml-1 animate-pulse">|</span>
                                    </Button>
                                </Link>

                                <Link to="/courses">
                                    <Button size="lg" variant="outline">
                                        <Play className="mr-2 h-4 w-4" />
                                        Watch Demo
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust */}
                            <div className="mt-10 pt-10 border-t">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Trusted by learners worldwide
                                </p>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-6 opacity-60">
                                    {["Google", "Microsoft", "Amazon", "Meta"].map((c) => (
                                        <span key={c} className="text-lg font-semibold">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* ✅ RIGHT: Visual */}
                        <div className="relative hidden lg:block">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 bg-card">

                                {/* Top bar */}
                                <div className="bg-muted p-4 border-8">
                                    <div className="flex items-center gap-2 ">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="ml-4 text-sm text-muted-foreground">main.js</span>
                                    </div>
                                </div>

                                {/* Code */}
                                <div className="bg-muted p-6 bg-card">
                                    <pre className="text-sm font-mono">
                                        <code>
                                            <span className="text-purple-500">const</span>{' '}
                                            <span className="text-blue-500">dream</span> = {'{'}
                                            {'\n'}  <span className="text-green-600">goal</span>:{' '}
                                            <span className="text-orange-500">&quot;Become a Developer&quot;</span>,
                                            {'\n'}  <span className="text-green-600">platform</span>:{' '}
                                            <span className="text-orange-500">&quot;CodeMaster&quot;</span>,
                                            {'\n'}  <span className="text-green-600">status</span>:{' '}
                                            <span className="text-orange-500">&quot;In Progress&quot;</span>
                                            {'\n'}{'}'};
                                            {'\n'}{'\n'}<span className="text-purple-500">await</span>{' '}
                                            <span className="text-blue-500">dream</span>.
                                            <span className="text-yellow-600">achieve</span>();
                                            {'\n'}<span className="text-gray-500">// Your success story starts here</span>
                                        </code>
                                    </pre>
                                </div>

                                {/* Floating cards */}
                                <div className="absolute bottom-24 right-6 bg-card p-4 rounded-xl shadow-lg border animate-bounce delay-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                            <Code2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">100+ Courses</p>
                                            <p className="text-xs text-muted-foreground">Expert-led learning</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-3 right-6 bg-card p-4 rounded-xl shadow-lg border animate-bounce delay-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">50K+ Students</p>
                                            <p className="text-xs text-muted-foreground">Learning together</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* Featured Courses */}
            <section className="py-10">
                <div className="container-max">
                    <div className="text-center mb-6">
                        <Badge variant="secondary" className="mb-4">Popular Courses</Badge>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                            Explore Our <span className="gradient-text">Top Courses</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Hand-picked courses designed by industry experts to give you real-world skills
                        </p>
                    </div>

                    <div className="overflow-hidden marquee-container">
                        <div className="flex gap-6 animate-marquee-slow w-max">
                            {coursesLoading
                                ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="w-[300px] shrink-0"><CourseCardSkeleton /></div>)
                                : [...courses.slice(0, 4), ...courses.slice(0, 4)].map((course: any, idx: number) => (
                                    <Link key={`${course._id}-${idx}`} to={`/courses/${course.slug}`} className="w-[300px] shrink-0">
                                        <Card className="overflow-hidden group h-full hover:border-primary/30">
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={course.thumbnail || `https://picsum.photos/seed/${course._id}/400/250`}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                                                    {course.isFree && <Badge variant="success">Free</Badge>}
                                                </div>
                                                {course.discountPrice !== undefined && course.price > 0 && (
                                                    <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                                                        {calculateDiscount(course.price, course.discountPrice)}% OFF
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="text-xs text-muted-foreground mb-2">
                                                    {typeof course.category === 'object' ? course.category.name : 'Course'}
                                                </div>
                                                <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {course.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(course.totalDuration)}</span>
                                                    <span>•</span>
                                                    <span>{course.totalLessons} lessons</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{course.rating}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="font-bold text-lg">
                                                        {course.isFree ? (
                                                            <span className="text-emerald-600">Free</span>
                                                        ) : (
                                                            <>
                                                                {formatPrice(course.discountPrice ?? course.price)}
                                                                {course.discountPrice !== undefined && course.discountPrice < course.price && (
                                                                    <span className="text-sm text-muted-foreground line-through ml-2">{formatPrice(course.price)}</span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{course.enrollmentCount} enrolled</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <Link to="/courses">
                            <Button size="lg" variant="outline">
                                View All Courses
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>



            {/* Why Choose Us */}
            <section className="py-8 bg-muted/30">
                <div className="container-max">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                            Why Choose <span className="gradient-text">LearnHub?</span>
                        </h2>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
                        {[
                            { icon: Target, title: 'Industry-Ready Curriculum', description: 'Courses designed with real-world projects and industry requirements in mind. Learn skills employers actually want.' },
                            { icon: Users, title: 'Expert Instructors', description: 'Learn from professionals with 10+ years of experience at top tech companies like Google, Amazon, and Microsoft.' },
                            { icon: TrendingUp, title: 'Career Growth', description: 'Our alumni report an average 40% salary increase within 6 months of completing their courses.' },
                        ].map((item, i) => (
                            <Card key={i} className="p-8 text-center border-0 shadow-none bg-transparent hover:bg-background transition-colors min-w-[280px] md:min-w-0 snap-start">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                                    <item.icon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {stats && (
                <section className="py-10 bg-muted/30">
                    <div className="container-max">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { icon: Users, value: stats.students.toLocaleString() + '+', label: 'Active Students' },
                                { icon: BookOpen, value: stats.courses.toString() + '+', label: 'Expert Courses' },
                                { icon: Award, value: stats.orders.toLocaleString() + '+', label: 'Certificates Issued' },
                                { icon: Star, value: '4.8', label: 'Average Rating' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center p-4 rounded-xl bg-background border hover:border-primary/30 transition-colors">
                                    <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                                    <div className="font-heading text-2xl font-bold mb-1">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}


            {/* Technology Section */}
            <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">

                {/* Background Glow */}
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500/10 blur-3xl rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-400/10 blur-3xl rounded-full" />

                <div className="container-max relative z-10">

                    {/* Heading */}
                    <div className="text-center mb-14">
                        <Badge
                            variant="secondary"
                            className="mb-5 px-4 py-1 text-sm rounded-full"
                        >
                            Technologies
                        </Badge>

                        <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-5">
                            Learn Top{" "}
                            <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                                Industry Tools
                            </span>
                        </h2>

                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Master the skills that top companies are actively hiring for.
                        </p>
                    </div>

                    {/* Technology Cards */}
                    {(() => {
                        const techItems = [
                            { name: "React", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", gradient: "from-cyan-500/20 to-cyan-500/5", slug: "react" },
                            { name: "Node.js", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", gradient: "from-green-500/20 to-green-500/5", slug: "nodejs" },
                            { name: "Python", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", gradient: "from-blue-500/20 to-blue-500/5", slug: "python" },
                            { name: "AWS", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg", gradient: "from-orange-500/20 to-orange-500/5", slug: "aws" },
                            { name: "Docker", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg", gradient: "from-blue-600/20 to-blue-600/5", slug: "docker" },
                            { name: "MongoDB", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg", gradient: "from-emerald-500/20 to-emerald-500/5", slug: "mongodb" },
                        ];
                        const doubled = [...techItems, ...techItems];
                        return (
                            <div className="overflow-hidden marquee-container">
                                <div className="flex gap-8 animate-marquee-fast w-max">
                                    {doubled.map((tech, i) => (
                                        <Link key={i} to={`/courses?technology=${tech.slug}`} className="group">
                                            <div className="relative overflow-hidden w-[185px] py-8 px-6 rounded-3xl border border-border/50 bg-background/70 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl cursor-pointer">
                                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${tech.gradient}`} />
                                                <div className="relative z-10 flex flex-col items-center text-center">
                                                    <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 bg-white/80 dark:bg-black/20 border border-border/50 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                                        <img src={tech.image} alt={tech.name} className="h-9 w-9 object-contain" />
                                                    </div>
                                                    <h3 className="font-medium text-sm md:text-base whitespace-nowrap">{tech.name}</h3>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-8">
                <div className="container-max">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                            What Our <span className="gradient-text">Students Say</span>
                        </h2>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
                        {[
                            { name: 'Priya Sharma', role: 'Software Engineer at Google', content: 'LearnHub completely transformed my career. The web development course gave me the skills and confidence to land my dream job.', rating: 5 },
                            { name: 'Rahul Verma', role: 'Data Scientist at Amazon', content: 'The data science curriculum is incredibly well-structured. The hands-on projects were exactly what I needed to build my portfolio.', rating: 5 },
                            { name: 'Anita Desai', role: 'Freelance Developer', content: 'I went from zero coding experience to building full-stack apps in just 4 months. The community support is amazing!', rating: 5 },
                        ].map((testimonial, i) => (
                            <Card key={i} className="p-6 hover:border-primary/30 min-w-[300px] md:min-w-0 snap-start">
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{testimonial.content}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-semibold text-sm">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{testimonial.name}</div>
                                        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-gradient-to-r from-orange-500 to-amber-400 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Ready to Start Your Learning Journey?
                    </h2>
                    <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
                        Join thousands of students already building their future. Start with free courses and upgrade anytime.
                    </p>
                    <Link to="/register">
                        <Button size="xl" className="bg-white text-orange-600 hover:bg-white/90 shadow-2xl">
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}