import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { authAPI } from '@/services/endpoints';
import { useAuthStore } from '@/store/authStore';
import { registerSchema, type RegisterInput } from '@shared/types';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema as any),
    });

    const onSubmit = async (data: RegisterInput) => {
        setLoading(true);
        setError('');
        try {
            const result = await authAPI.register(data);
            setUser(result.data?.user as any);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center section-padding">
            <Card className="w-full max-w-md">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="font-heading text-2xl font-bold mb-2">Create Your Account</h1>
                        <p className="text-muted-foreground text-sm">Start your learning journey today</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" placeholder="John Doe" {...register('name')} />
                            </div>
                            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" placeholder="you@example.com" {...register('email')} />
                            </div>
                            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Phone (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" placeholder="9876543210" {...register('phone')} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-10 pr-10"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-10"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}