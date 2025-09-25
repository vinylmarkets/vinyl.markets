import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lightbulb, Info } from "lucide-react";

interface EducationalPrincipleBoxProps {
  principle: {
    title: string;
    content: string;
    difficulty?: string;
  };
}

export const EducationalPrincipleBox = ({ principle }: EducationalPrincipleBoxProps) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return <BookOpen className="h-5 w-5 text-green-600" />;
      case 'intermediate':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      case 'advanced':
        return <Info className="h-5 w-5 text-red-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon(principle.difficulty)}
            <CardTitle className="text-lg">
              {principle.title}
            </CardTitle>
          </div>
          
          {principle.difficulty && (
            <Badge variant="outline" className={getDifficultyColor(principle.difficulty)}>
              {principle.difficulty}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="prose prose-sm max-w-none">
          <div className="text-muted-foreground leading-relaxed">
            {principle.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};