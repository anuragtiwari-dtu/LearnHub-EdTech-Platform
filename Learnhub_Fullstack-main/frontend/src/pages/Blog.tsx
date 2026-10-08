import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock } from 'lucide-react';

const blogPosts = [
    { id: '1', title: 'The Future of Web Development in 2024', excerpt: 'Explore the trends shaping modern web development, from AI-assisted coding to edge computing.', category: 'Web Dev', readTime: '5 min', image: 'webdev2024' },
    { id: '2', title: 'Getting Started with Machine Learning', excerpt: 'A beginner-friendly guide to understanding ML concepts and building your first model.', category: 'AI/ML', readTime: '8 min', image: 'ml-guide' },
    { id: '3', title: 'Why TypeScript is Taking Over', excerpt: 'TypeScript has become the standard for large-scale applications. Here is why you should learn it.', category: 'TypeScript', readTime: '4 min', image: 'typescript' },
    { id: '4', title: 'Cloud Computing Explained', excerpt: 'From AWS to Azure, understand the fundamentals of cloud infrastructure and deployment.', category: 'Cloud', readTime: '6 min', image: 'cloud' },
    { id: '5', title: 'Cybersecurity Essentials for Developers', excerpt: 'Every developer needs to understand security basics. This guide covers the essentials.', category: 'Security', readTime: '7 min', image: 'security' },
    { id: '6', title: 'Building Scalable APIs with Node.js', excerpt: 'Best practices for designing and building production-ready REST APIs with Express and MongoDB.', category: 'Backend', readTime: '10 min', image: 'nodejs-api' },
];

export default function Blog() {
    return (
        <div className="py-4">
            <div className="container-max">
                <div className="text-center mb-12">
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                        Our <span className="gradient-text">Blog</span>
                    </h1>
                    <p className="text-muted-foreground">Insights, tutorials, and industry updates</p>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
                    {blogPosts.map((post) => (
                        <Link key={post.id} to={`/blog/${post.id}`} className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-start">
                            <Card className="overflow-hidden group h-full hover:border-primary/30 transition-all duration-300">
                                <div className="h-40 sm:h-48 overflow-hidden">
                                    <img
                                        src={`https://picsum.photos/seed/${post.image}/600/400`}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                        <Badge variant="secondary" className="text-[10px] sm:text-xs">{post.category}</Badge>
                                        <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {post.readTime}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">{post.title}</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                                    <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-primary font-medium flex items-center gap-1">
                                        Read More <ArrowRight className="h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}