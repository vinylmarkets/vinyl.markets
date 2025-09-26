import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Terminal, Briefcase, ArrowLeft, Rocket } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ProductDevelopment() {
  const navigate = useNavigate();

  const developmentSections = [
    {
      title: "Analytics Terminal",
      description: "Advanced analytics terminal for market data and insights",
      icon: Terminal,
      href: "/dashboard/terminal",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      metrics: [
        { label: "Status", value: "Beta" },
        { label: "Features", value: "Advanced" }
      ]
    },
    {
      title: "Charts & Analytics",
      description: "Interactive charts and comprehensive analytics dashboard",
      icon: TrendingUp,
      href: "/dashboard/charts",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      metrics: [
        { label: "Charts", value: "Interactive" },
        { label: "Data", value: "Real-time" }
      ]
    },
    {
      title: "Portfolio Manager",
      description: "Manage and track investment portfolios and performance",
      icon: Briefcase,
      href: "/dashboard/portfolio",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      metrics: [
        { label: "Tracking", value: "Portfolio" },
        { label: "Status", value: "Phase 2" }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Rocket className="h-8 w-8" />
                Product Development
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Phase 2 features in development for future release
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developmentSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card key={section.title} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${section.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {section.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                {section.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {section.metrics.map((metric, index) => (
                      <div key={index} className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-semibold text-sm">{metric.value}</div>
                        <div className="text-xs text-muted-foreground">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Link to={section.href}>
                  <Button className="w-full group-hover:bg-primary/90 transition-colors">
                    Access Feature
                    <TrendingUp className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Development Roadmap</CardTitle>
          <CardDescription>
            These features are currently in active development as part of Phase 2 of our platform expansion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Current Phase</div>
                <div className="text-sm text-muted-foreground">Phase 2 - Advanced Analytics & Portfolio Tools</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-blue-600">In Progress</div>
                <div className="text-xs text-muted-foreground">Est. Q2 2024</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">✓ Analytics Terminal</div>
                <div className="text-green-600">Beta testing phase</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="font-medium text-yellow-800">⚡ Charts & Analytics</div>
                <div className="text-yellow-600">UI development</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-800">🚀 Portfolio Manager</div>
                <div className="text-purple-600">Architecture planning</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}