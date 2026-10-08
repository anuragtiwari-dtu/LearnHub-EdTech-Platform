import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { paymentAPI } from '@/services/endpoints';
import toast from 'react-hot-toast';

export default function Cart() {
    const { items, removeItem, getCartTotal, clearCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const handleCheckout = async (courseId: string) => {
        if (!isAuthenticated) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        try {
            const toastId = toast.loading('Initializing checkout...');
            // Since checkout supports one item at a time currently
            const result = await paymentAPI.createOrder(courseId, 'razorpay');
            toast.dismiss(toastId);

            if (result.data?.isFree) {
                toast.success('Enrolled successfully!');
                removeItem(courseId);
                navigate('/dashboard');
                return;
            }

            if (result.data?.razorpayOrderId) {
                const options = {
                    key: result.data.razorpayKey,
                    amount: result.data.amount,
                    currency: result.data.currency,
                    name: 'LearnHub',
                    description: 'Course Purchase',
                    order_id: result.data.razorpayOrderId,
                    handler: async (response: any) => {
                        const verifyToast = toast.loading('Verifying payment...');
                        try {
                            await paymentAPI.verifyPayment({
                                provider: 'razorpay',
                                orderId: result.data.orderId,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            });
                            toast.success('Payment successful!');
                            removeItem(courseId);
                            navigate('/dashboard');
                        } catch (err: any) {
                            toast.error('Payment verification failed');
                        } finally {
                            toast.dismiss(verifyToast);
                        }
                    },
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Checkout failed');
        }
    };

    if (items.length === 0) {
        return (
            <div className="section-padding min-h-[70vh] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md mx-auto">
                    <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold">Your Cart is Empty</h2>
                    <p className="text-muted-foreground">Looks like you haven't added any courses to your cart yet. Keep shopping to find a course!</p>
                    <Link to="/courses">
                        <Button size="lg" className="w-full sm:w-auto">Keep Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="section-padding min-h-[70vh] bg-muted/30">
            <div className="container-max">
                <h1 className="font-heading text-3xl font-bold mb-8 flex items-center gap-3">
                    <ShoppingCart className="h-8 w-8" /> 
                    Shopping Cart
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-lg">{items.length} Course{items.length !== 1 ? 's' : ''} in Cart</h2>
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={clearCart}>
                                Clear Cart
                            </Button>
                        </div>
                        {items.map((item) => (
                            <Card key={item._id} className="overflow-hidden hover:border-primary/30 transition-colors">
                                <CardContent className="p-0 flex flex-col sm:flex-row">
                                    <div className="w-full sm:w-48 h-32 sm:h-auto shrink-0 relative bg-muted">
                                        <img 
                                            src={item.thumbnail || `https://picsum.photos/seed/${item._id}/400/250`} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover"
                                        />
                                        {item.level && (
                                            <Badge className="absolute top-2 left-2 shadow-md">{item.level}</Badge>
                                        )}
                                    </div>
                                    <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <Link to={`/courses/${item._id}`} className="hover:text-primary transition-colors">
                                                    <h3 className="font-bold text-lg leading-tight mb-1">{item.title}</h3>
                                                </Link>
                                                {item.instructor && (
                                                    <p className="text-sm text-muted-foreground">By {item.instructor.name}</p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="font-bold text-xl text-primary">
                                                    {formatPrice(item.discountPrice ?? item.price)}
                                                </div>
                                                {item.discountPrice !== undefined && item.discountPrice < item.price && (
                                                    <div className="text-sm text-muted-foreground line-through">
                                                        {formatPrice(item.price)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center border-t pt-4">
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2" onClick={() => removeItem(item._id)}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Remove
                                            </Button>
                                            <Button size="sm" onClick={() => handleCheckout(item._id)}>
                                                Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 border-2 shadow-lg shadow-primary/5">
                            <CardContent className="p-6">
                                <h2 className="font-heading text-xl font-bold mb-4 border-b pb-4">Order Summary</h2>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Total Price</span>
                                        <span>{formatPrice(items.reduce((sum, i) => sum + i.price, 0))}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Total Discount</span>
                                        <span>-{formatPrice(items.reduce((sum, i) => sum + (i.price - (i.discountPrice ?? i.price)), 0))}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between font-bold text-2xl">
                                        <span>Total</span>
                                        <span className="text-primary">{formatPrice(getCartTotal())}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    To checkout multiple items, please click checkout on each individual course.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
