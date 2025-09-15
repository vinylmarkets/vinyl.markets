import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Clock, Trophy } from "lucide-react";

const learningModules = [
  {
    id: 1,
    title: "Market Fundamentals",
    description: "Understanding basic market concepts and terminology",
    progress: 100,
    completed: true,
    lessons: 8,
    completedLessons: 8
  },
  {
    id: 2,
    title: "Technical Analysis Basics",
    description: "Chart patterns, indicators, and trading signals",
    progress: 75,
    completed: false,
    lessons: 12,
    completedLessons: 9
  },
  {
    id: 3,
    title: "Risk Management",
    description: "Portfolio protection and position sizing strategies",
    progress: 45,
    completed: false,
    lessons: 10,
    completedLessons: 4
  },
  {
    id: 4,
    title: "Options Trading",
    description: "Advanced strategies using options contracts",
    progress: 0,
    completed: false,
    lessons: 15,
    completedLessons: 0
  }
];

const achievements = [
  {
    id: 1,
    title: "First Steps",
    description: "Complete your first learning module",
    earned: true,
    icon: "🎯"
  },
  {
    id: 2,
    title: "Consistent Learner",
    description: "Complete lessons for 7 days straight",
    earned: true,
    icon: "🔥"
  },
  {
    id: 3,
    title: "Technical Expert",
    description: "Master technical analysis fundamentals",
    earned: false,
    icon: "📊"
  }
];

export default function LearningProgress() {
  const overallProgress = Math.round(
    learningModules.reduce((acc, module) => acc + module.progress, 0) / learningModules.length
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learning Progress</h1>
          <p className="text-muted-foreground">Track your trading education journey</p>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{overallProgress}%</span>
                <Badge variant="secondary">
                  {learningModules.filter(m => m.completed).length} / {learningModules.length} modules completed
                </Badge>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Learning Modules */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Learning Modules</h2>
          <div className="grid gap-4">
            {learningModules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {module.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-500" />
                        )}
                        {module.title}
                      </CardTitle>
                      <p className="text-muted-foreground">{module.description}</p>
                    </div>
                    <Badge variant={module.completed ? "default" : "outline"}>
                      {module.completedLessons} / {module.lessons} lessons
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.earned ? "border-green-200 bg-green-50/50" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <CardTitle className="text-base">{achievement.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.earned && (
                      <Trophy className="w-5 h-5 text-yellow-500 ml-auto" />
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}