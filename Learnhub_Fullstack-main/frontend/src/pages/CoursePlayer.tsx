import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import { ArrowLeft, CheckCircle, Circle, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { courseAPI, progressAPI } from '@/services/endpoints';
import { formatDuration } from '@/lib/utils';

export default function CoursePlayer() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [activeLesson, setActiveLesson] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { data: courseData, isLoading } = useQuery({
        queryKey: ['course-content', courseId],
        queryFn: () => courseAPI.getContent(courseId!),
        enabled: !!courseId,
    });

    const { data: progressData } = useQuery({
        queryKey: ['progress', courseId],
        queryFn: () => progressAPI.getProgress(courseId!),
        enabled: !!courseId,
    });

    const course = courseData?.data;
    const progress = progressData?.data;
    const completedLessons: string[] = progress?.completedLessons?.map((id: any) => id.toString()) || [];

    const allLessons = course?.sections?.flatMap((s: any) => s.lessons) || [];
    const currentLesson = allLessons.find((l: any) => l._id === activeLesson) || allLessons[0];

    const handleMarkComplete = async (lessonId: string) => {
        try {
            await progressAPI.markComplete(courseId!, lessonId);
        } catch (error) {
            console.error('Failed to mark complete:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">Course not found</h2>
                    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Top Bar */}
            <div className="h-14 border-b flex items-center px-4 gap-4 flex-shrink-0 bg-background">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div className="flex-1 truncate">
                    <h1 className="font-semibold text-sm truncate">{course.title}</h1>
                </div>
                {progress && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Progress value={progress.progressPercentage} className="h-2 w-24" />
                        <span>{progress.progressPercentage}%</span>
                    </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                </Button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 bg-black relative">
                        {currentLesson?.videoUrl ? (
                            <ReactPlayer
                                url={currentLesson.videoUrl}
                                width="100%"
                                height="100%"
                                controls
                                playing={false}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white">
                                <p>This lesson is locked. Purchase the course to access it.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-background">
                        <h2 className="font-semibold text-lg">{currentLesson?.title || 'Select a lesson'}</h2>
                        {currentLesson?.description && <p className="text-sm text-muted-foreground mt-1">{currentLesson.description}</p>}
                        <div className="flex items-center gap-3 mt-3">
                            {currentLesson && (
                                <Button
                                    size="sm"
                                    variant={completedLessons.includes(currentLesson._id) ? 'secondary' : 'default'}
                                    onClick={() => handleMarkComplete(currentLesson._id)}
                                >
                                    {completedLessons.includes(currentLesson._id) ? (
                                        <><CheckCircle className="mr-1 h-4 w-4" /> Completed</>
                                    ) : (
                                        'Mark as Complete'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                {sidebarOpen && (
                    <div className="w-80 border-l overflow-y-auto bg-muted/30 flex-shrink-0">
                        {course.sections?.map((section: any, si: number) => (
                            <div key={si}>
                                <div className="px-4 py-3 bg-muted/50 border-b">
                                    <h3 className="font-semibold text-sm">{section.title}</h3>
                                    <p className="text-xs text-muted-foreground">{section.lessons.length} lessons</p>
                                </div>
                                {section.lessons.map((lesson: any, li: number) => {
                                    const isCompleted = completedLessons.includes(lesson._id?.toString());
                                    const isActive = activeLesson === lesson._id;
                                    const isLocked = !lesson.isFree && !lesson.videoUrl;

                                    return (
                                        <button
                                            key={li}
                                            onClick={() => !isLocked && setActiveLesson(lesson._id)}
                                            className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b hover:bg-muted/50 transition-colors ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                                                }`}
                                        >
                                            <div className="mt-0.5">
                                                {isCompleted ? (
                                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                ) : isLocked ? (
                                                    <Circle className="h-4 w-4 text-muted-foreground/30" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">{lesson.title}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {formatDuration(lesson.duration)}
                                                    {lesson.isFree && <span className="ml-2 text-primary">Free</span>}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}