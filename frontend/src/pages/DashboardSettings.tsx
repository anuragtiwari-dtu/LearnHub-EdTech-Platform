import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Settings, User, Lock, Palette, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { userAPI, authAPI } from '@/services/endpoints';
import { cn } from '@/lib/utils';

export default function DashboardSettings() {
    const { user, setUser } = useAuthStore();
    const { theme, setTheme } = useThemeStore();
    const [profileMsg, setProfileMsg] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [shakeField, setShakeField] = useState<'current' | 'confirm' | ''>('');

    const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
        defaultValues: { name: user?.name || '', phone: user?.phone || '' },
    });

    const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    });

    const onProfileUpdate = async (data: any) => {
        try {
            const result = await userAPI.updateProfile(data);
            setUser(result.data as any);
            setProfileMsg('Profile updated successfully');
            setTimeout(() => setProfileMsg(''), 3000);
        } catch (error) {
            setProfileMsg('Failed to update profile');
        }
    };

    const onPasswordChange = async (data: any) => {
        setShakeField('');
        if (data.newPassword !== data.confirmPassword) {
            setPasswordError('Passwords do not match');
            setShakeField('confirm');
            setTimeout(() => setShakeField(''), 400);
            return;
        }
        try {
            await authAPI.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setPasswordMsg('Password changed successfully');
            setPasswordError('');
            resetPassword();
            setTimeout(() => setPasswordMsg(''), 3000);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to change password';
            setPasswordError(msg);
            if (msg.toLowerCase().includes('current password')) {
                setShakeField('current');
                setTimeout(() => setShakeField(''), 400);
            }
        }
    };

    return (
        <div className="max-w-[500px] mx-auto space-y-6">
                <h1 className="font-heading text-2xl font-bold flex items-center justify-center gap-2 mb-8">
                    <Settings className="h-6 w-6 text-primary" /> Account Settings
                </h1>

                <Tabs defaultValue="profile">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="profile"><User className="h-4 w-4 mr-2 hidden sm:block" /> Profile</TabsTrigger>
                        <TabsTrigger value="password"><Lock className="h-4 w-4 mr-2 hidden sm:block" /> Password</TabsTrigger>
                        <TabsTrigger value="appearance"><Palette className="h-4 w-4 mr-2 hidden sm:block" /> Theme</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-xl">Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4 max-w-md mx-auto mt-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Name</label>
                                        <Input {...registerProfile('name', { required: 'Name is required' })} />
                                        {profileErrors.name && <p className="text-xs text-destructive mt-1">{profileErrors.name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Email</label>
                                        <Input value={user?.email || ''} disabled className="bg-muted" />
                                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Phone</label>
                                        <Input {...registerProfile('phone')} placeholder="Enter phone number" />
                                    </div>
                                    {profileMsg && (
                                        <p className={cn('text-sm', profileMsg.includes('success') ? 'text-emerald-600' : 'text-destructive')}>
                                            {profileMsg}
                                        </p>
                                    )}
                                    <Button type="submit" className="w-full">Save Changes</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="password">
                        <Card>
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-xl">Change Password</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4 max-w-md mx-auto mt-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                                        <Input type="password" {...registerPassword('currentPassword', { required: 'Required' })} className={cn(shakeField === 'current' && 'animate-shake border-destructive text-destructive')} />
                                        {passwordErrors.currentPassword && <p className="text-xs text-destructive mt-1">{passwordErrors.currentPassword.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">New Password</label>
                                        <Input type="password" {...registerPassword('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                                        {passwordErrors.newPassword && <p className="text-xs text-destructive mt-1">{passwordErrors.newPassword.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Confirm New Password</label>
                                        <Input type="password" {...registerPassword('confirmPassword', { required: 'Required' })} className={cn(shakeField === 'confirm' && 'animate-shake border-destructive text-destructive')} />
                                        {passwordErrors.confirmPassword && <p className="text-xs text-destructive mt-1">{passwordErrors.confirmPassword.message}</p>}
                                    </div>
                                    {passwordMsg && <p className="text-sm text-emerald-600 text-center">{passwordMsg}</p>}
                                    {passwordError && <p className="text-sm text-destructive text-center">{passwordError}</p>}
                                    <Button type="submit" className="w-full">Change Password</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance">
                        <Card>
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-xl">Appearance</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <p className="text-sm text-muted-foreground mb-4 text-center">Customize how LearnHub looks on your device</p>
                                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mt-4">
                                    {(['light', 'dark'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTheme(t)}
                                            className={cn(
                                                'p-4 rounded-xl border-2 text-center transition-all capitalize',
                                                theme === t
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/30'
                                            )}
                                        >
                                            <div className={cn(
                                                'h-8 w-12 rounded-lg mx-auto mb-2 border',
                                                t === 'light' ? 'bg-white border-gray-200' :
                                                    t === 'dark' ? 'bg-gray-800 border-gray-700' :
                                                        'bg-gradient-to-r from-white to-gray-800 border-gray-400'
                                            )} />
                                            <span className="text-sm font-medium">{t}</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
    );
}