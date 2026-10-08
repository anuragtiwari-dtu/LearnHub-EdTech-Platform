import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, CheckCircle2, Circle, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/services/api';
import { format } from 'date-fns';

export default function ManageContacts() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['contacts', page],
        queryFn: () => adminAPI.getContacts(`page=${page}&limit=${limit}`),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => 
            adminAPI.updateContactStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
    });

    const contacts = data?.data || [];
    const meta = data?.meta || { totalPages: 1 };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading messages...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" /> Contact Messages
                </h1>
            </div>

            {contacts.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No contact messages found.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {contacts.map((contact: any) => (
                        <Card key={contact._id} className={`overflow-hidden transition-all ${contact.status === 'unread' ? 'border-primary/50 bg-primary/5' : ''}`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg">{contact.subject}</h3>
                                            {contact.status === 'unread' && <Badge variant="default" className="animate-pulse">New</Badge>}
                                            {contact.status === 'read' && <Badge variant="secondary">Read</Badge>}
                                            {contact.status === 'replied' && <Badge variant="success" className="bg-emerald-500">Replied</Badge>}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                            <span className="font-medium text-foreground">{contact.name}</span>
                                            <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {contact.email}
                                            </a>
                                            <span>{format(new Date(contact.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                        </div>
                                        <div className="bg-background rounded-lg p-4 text-sm border whitespace-pre-wrap">
                                            {contact.message}
                                        </div>
                                    </div>
                                    
                                    <div className="flex md:flex-col gap-2 justify-end min-w-[140px]">
                                        {contact.status !== 'unread' && (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => statusMutation.mutate({ id: contact._id, status: 'unread' })}
                                            >
                                                <Circle className="h-4 w-4 mr-2 text-primary" /> Mark Unread
                                            </Button>
                                        )}
                                        {contact.status !== 'read' && (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => statusMutation.mutate({ id: contact._id, status: 'read' })}
                                            >
                                                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" /> Mark Read
                                            </Button>
                                        )}
                                        {contact.status !== 'replied' && (
                                            <Button 
                                                variant="default" 
                                                size="sm"
                                                onClick={() => {
                                                    window.location.href = `mailto:${contact.email}?subject=Re: ${contact.subject}`;
                                                    statusMutation.mutate({ id: contact._id, status: 'replied' });
                                                }}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" /> Reply
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm font-medium">
                        Page {page} of {meta.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        disabled={page === meta.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
