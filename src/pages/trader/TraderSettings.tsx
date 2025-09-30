import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { 
  Palette, 
  DollarSign, 
  Bell, 
  Monitor, 
  Save,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { TraderProtection } from "@/components/trader/TraderProtection";

interface TradingSettings {
  defaultPositionSize: number;
  riskTolerance: number;
  autoTradeEnabled: boolean;
  confirmationPrompts: boolean;
  emailAlerts: boolean;
  signalThreshold: number;
  dailySummary: boolean;
  defaultView: 'chart' | 'flow';
  knowledgeMode: 'simple' | 'academic';
  numberFormat: 'abbreviated' | 'full';
  timeZone: string;
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  woodHeaderEnabled: boolean;
}

const TraderSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<TradingSettings>({
    defaultPositionSize: 1000,
    riskTolerance: 3,
    autoTradeEnabled: false,
    confirmationPrompts: true,
    emailAlerts: true,
    signalThreshold: 75,
    dailySummary: true,
    defaultView: 'chart',
    knowledgeMode: 'simple',
    numberFormat: 'abbreviated',
    timeZone: 'America/New_York',
    theme: 'auto',
    accentColor: 'blue',
    woodHeaderEnabled: false
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('trader-settings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('trader-theme') || 'auto';
    setSettings(prev => ({ ...prev, theme: savedTheme as 'light' | 'dark' | 'auto' }));
  }, []);

  const updateSetting = <K extends keyof TradingSettings>(
    key: K,
    value: TradingSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('trader-settings', JSON.stringify(newSettings));
    
    // Apply theme immediately
    if (key === 'theme') {
      applyTheme(value as string);
      localStorage.setItem('trader-theme', value as string);
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  const handleSave = async () => {
    try {
      // Save to localStorage for immediate UI updates
      localStorage.setItem('trader-settings', JSON.stringify(settings));
      
      // Save to database for backend use (auto-trading, etc.)
      const { error } = await supabase
        .from('user_settings')
        .upsert([{
          user_id: user?.id,
          settings: settings as any
        }]);
        
      if (error) {
        console.error('Error saving settings to database:', error);
        toast({
          title: "Settings Saved Locally",
          description: "Settings saved to browser but not synced to server. Auto-trading may not work.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been saved successfully. Auto-trading is now configured.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const accentColors = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
  ];

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center space-x-4">
              <Link to="/trader">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Trading
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
            <Button onClick={handleSave} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </header>

        {/* Settings Content */}
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Theme Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Theme Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme Mode</Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={(value: 'light' | 'dark' | 'auto') => updateSetting('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex space-x-2">
                    {accentColors.map((color) => (
                      <Button
                        key={color.value}
                        variant={settings.accentColor === color.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting('accentColor', color.value)}
                        className="flex items-center space-x-2"
                      >
                        <div className={`w-3 h-3 rounded-full ${color.color}`} />
                        <span>{color.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Wood Panel Header</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply a realistic wood panel background to the trader platform header
                  </p>
                </div>
                <Switch
                  checked={settings.woodHeaderEnabled}
                  onCheckedChange={(checked) => updateSetting('woodHeaderEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trading Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Trading Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position-size">Default Position Size ($)</Label>
                  <Input
                    id="position-size"
                    type="number"
                    value={settings.defaultPositionSize}
                    onChange={(e) => updateSetting('defaultPositionSize', Number(e.target.value))}
                    placeholder="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Risk Tolerance Level: {settings.riskTolerance}/5</Label>
                  <Slider
                    value={[settings.riskTolerance]}
                    onValueChange={(value) => updateSetting('riskTolerance', value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Trade Signals</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically execute trades based on signals
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoTradeEnabled}
                    onCheckedChange={(checked) => updateSetting('autoTradeEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Confirmation Prompts</Label>
                    <p className="text-sm text-muted-foreground">
                      Show confirmation before executing trades
                    </p>
                  </div>
                  <Switch
                    checked={settings.confirmationPrompts}
                    onCheckedChange={(checked) => updateSetting('confirmationPrompts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={settings.emailAlerts}
                  onCheckedChange={(checked) => updateSetting('emailAlerts', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Signal Threshold for Alerts: {settings.signalThreshold}%</Label>
                <Slider
                  value={[settings.signalThreshold]}
                  onValueChange={(value) => updateSetting('signalThreshold', value[0])}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50% (More alerts)</span>
                  <span>100% (Fewer alerts)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily performance summary emails
                  </p>
                </div>
                <Switch
                  checked={settings.dailySummary}
                  onCheckedChange={(checked) => updateSetting('dailySummary', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Display Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default View</Label>
                  <Select 
                    value={settings.defaultView} 
                    onValueChange={(value: 'chart' | 'flow') => updateSetting('defaultView', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chart">Chart View</SelectItem>
                      <SelectItem value="flow">Signal Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Knowledge Mode Default</Label>
                  <Select 
                    value={settings.knowledgeMode} 
                    onValueChange={(value: 'simple' | 'academic') => updateSetting('knowledgeMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number Format</Label>
                  <Select 
                    value={settings.numberFormat} 
                    onValueChange={(value: 'abbreviated' | 'full') => updateSetting('numberFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abbreviated">Abbreviated (1.2K, 1.5M)</SelectItem>
                      <SelectItem value="full">Full Numbers (1,200, 1,500,000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select 
                    value={settings.timeZone} 
                    onValueChange={(value) => updateSetting('timeZone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg" className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save All Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </TraderProtection>
  );
};

export default TraderSettings;