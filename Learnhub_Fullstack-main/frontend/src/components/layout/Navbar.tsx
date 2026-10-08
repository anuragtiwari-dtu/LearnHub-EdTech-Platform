import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Moon, Sun, Monitor, GraduationCap, LayoutDashboard, Settings, LogOut, User as UserIcon, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { authAPI } from '@/services/endpoints';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
    const { user, isAuthenticated, logout: storeLogout } = useAuthStore();
    const { theme, setTheme } = useThemeStore();
    const { items: cartItems } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close sidebar on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsProfileSidebarOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } catch { } finally {
            storeLogout();
            setIsProfileSidebarOpen(false);
            setIsMobileOpen(false);
            navigate('/');
        }
    };

    const themeIcon = theme === 'dark' ? <Moon className="h-4 w-4" /> : theme === 'light' ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;

    return (
        <>
            <header className={cn(
                'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
                isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm border-b' : 'bg-transparent'
            )}>
                <nav className="container-max flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-heading font-bold text-xl hidden sm:block">
                            Learn<span className="text-primary">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link to="/" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent/10 transition-colors">Home</Link>
                        <Link to="/courses" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent/10 transition-colors">Courses</Link>
                        <Link to="/blog" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent/10 transition-colors">Blog</Link>
                        <Link to="/about" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent/10 transition-colors">About</Link>
                        <Link to="/contact" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent/10 transition-colors">Contact</Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 lg:gap-4">
                        {/* Desktop Search Bar */}
                        <div className="hidden md:flex relative items-center">
                            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="h-9 w-40 lg:w-56 bg-accent/10 rounded-full pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all focus:bg-background"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = (e.target as HTMLInputElement).value;
                                        if (val) navigate(`/courses?search=${val}`);
                                    }
                                }}
                            />
                        </div>

                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent/10 transition-colors"
                        >
                            <Search className="h-4 w-4" />
                        </button>

                        {/* Wishlist & Cart Icons */}
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard/wishlist" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                                    <Heart className="h-5 w-5" />
                                    {(user?.wishlist?.length ?? 0) > 0 && (
                                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                    )}
                                </Link>

                                <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center">
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartItems.length > 0 && (
                                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                    )}
                                </Link>
                            </>
                        )}

                        {isAuthenticated ? (
                            <button
                                onClick={() => setIsProfileSidebarOpen(true)}
                                className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-shadow ml-1"
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </button>
                        ) : (
                            <div className="hidden md:flex items-center gap-2 ml-1">
                                <Link to="/register">
                                    <Button size="sm">Start Learning</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Toggle for non-authenticated */}
                        {!isAuthenticated && (
                            <button
                                onClick={() => setIsMobileOpen(!isMobileOpen)}
                                className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent/10 ml-1"
                            >
                                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        )}
                    </div>
                </nav>

                {/* Search Bar Mobile Dropdown */}
                {searchOpen && (
                    <div className="md:hidden border-b bg-background/95 backdrop-blur-sm px-4 py-3">
                        <div className="container-max">
                            <input
                                type="text"
                                placeholder="Search courses, topics, instructors..."
                                className="w-full h-10 bg-muted rounded-lg px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate(`/courses?search=${(e.target as HTMLInputElement).value}`);
                                        setSearchOpen(false);
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Menu for non-authenticated */}
                {!isAuthenticated && isMobileOpen && (
                    <div className="md:hidden border-b bg-background/95 backdrop-blur-sm">
                        <div className="px-4 py-4 space-y-1">
                            <Link to="/" onClick={() => setIsMobileOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">Home</Link>
                            <Link to="/courses" onClick={() => setIsMobileOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">Courses</Link>
                            <Link to="/blog" onClick={() => setIsMobileOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">Blog</Link>
                            <Link to="/about" onClick={() => setIsMobileOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">About</Link>
                            <Link to="/contact" onClick={() => setIsMobileOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">Contact</Link>
                            <div className="pt-2 border-t mt-2 flex flex-col gap-2">

                                <Link to="/register" onClick={() => setIsMobileOpen(false)}>
                                    <Button className="w-full" size="sm">Start Learning Free</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Profile Sidebar */}
            {isAuthenticated && isProfileSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                        onClick={() => setIsProfileSidebarOpen(false)}
                    />

                    {/* Sidebar Panel */}
                    <div className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-background border-l shadow-2xl z-50 flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <span className="font-semibold text-lg">My Profile</span>
                            <button
                                onClick={() => setIsProfileSidebarOpen(false)}
                                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="p-6 border-b flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <h3 className="font-bold text-lg">{user?.name || 'User'}</h3>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                            <div className="mt-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                                {user?.role === 'admin' ? 'Administrator' : 'Student'}
                            </div>
                        </div>

                        {/* Links & Settings */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Navigation */}
                            <div className="space-y-1">
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsProfileSidebarOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                                >
                                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                                    Dashboard
                                </Link>


                                <Link
                                    to="/cart"
                                    onClick={() => setIsProfileSidebarOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                                >
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    Cart
                                </Link>

                                <Link
                                    to="/dashboard/wishlist"
                                    onClick={() => setIsProfileSidebarOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                                >
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    WishList
                                </Link>

                                <Link
                                    to="/dashboard/settings"
                                    onClick={() => setIsProfileSidebarOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                                >
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    Account Settings
                                </Link>
                            </div>
                        </div>

                        {/* Footer / Logout */}
                        <div className="p-4 border-t bg-muted/30">
                            <Button
                                variant="destructive"
                                className="w-full flex items-center justify-center gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}