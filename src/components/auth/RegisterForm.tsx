import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  investmentExperience: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your investment experience",
  }),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"], {
    required_error: "Please select your risk tolerance",
  }),
  educationalPurpose: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge the educational purpose",
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and privacy policy",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onClose: () => void;
}

export function RegisterForm({ onClose }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "Enter password" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = ["text-destructive", "text-orange-500", "text-yellow-500", "text-secondary"];
    
    return { 
      strength: score, 
      label: labels[Math.min(score - 1, 3)] || "Weak",
      color: colors[Math.min(score - 1, 3)] || "text-destructive"
    };
  };

  const passwordStrength = getPasswordStrength(password || "");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: authError.message,
        });
        return;
      }

      // If user is created, store additional profile data
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: data.fullName,
              investment_experience: data.investmentExperience,
              risk_tolerance: data.riskTolerance,
              terms_accepted: true,
              educational_purpose_acknowledged: true,
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail the registration if profile creation fails
        }
      }

      toast({
        title: "Welcome to TubeAmp!",
        description: "Please check your email to verify your account.",
      });
      
      onClose();
      
      // Redirect to dashboard or verification page
      window.location.href = "/dashboard";
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          {...register("fullName")}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {errors.fullName.message}
          </div>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {errors.email.message}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            {...register("password")}
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Password Strength:</span>
              <span className={passwordStrength.color}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  passwordStrength.strength <= 1 ? 'bg-destructive' :
                  passwordStrength.strength === 2 ? 'bg-orange-500' :
                  passwordStrength.strength === 3 ? 'bg-yellow-500' :
                  'bg-secondary'
                }`}
                style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {errors.password && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {errors.password.message}
          </div>
        )}
      </div>

      {/* Investment Experience */}
      <div className="space-y-3">
        <Label>Investment Experience</Label>
        <Select onValueChange={(value) => setValue("investmentExperience", value as any)}>
          <SelectTrigger className={errors.investmentExperience ? "border-destructive" : ""}>
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
            <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
            <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
          </SelectContent>
        </Select>
        {errors.investmentExperience && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {errors.investmentExperience.message}
          </div>
        )}
      </div>

      {/* Risk Tolerance */}
      <div className="space-y-3">
        <Label>Risk Tolerance</Label>
        <RadioGroup 
          onValueChange={(value) => setValue("riskTolerance", value as any)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="conservative" id="conservative" />
            <Label htmlFor="conservative" className="text-sm">
              Conservative - I prefer stable, lower-risk investments
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="moderate" id="moderate" />
            <Label htmlFor="moderate" className="text-sm">
              Moderate - I accept some risk for potential growth
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="aggressive" id="aggressive" />
            <Label htmlFor="aggressive" className="text-sm">
              Aggressive - I'm comfortable with high risk for high rewards
            </Label>
          </div>
        </RadioGroup>
        {errors.riskTolerance && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {errors.riskTolerance.message}
          </div>
        )}
      </div>

      {/* Educational Purpose Acknowledgment */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="educationalPurpose" 
            onCheckedChange={(checked) => setValue("educationalPurpose", !!checked)}
            className={errors.educationalPurpose ? "border-destructive" : ""}
          />
          <Label htmlFor="educationalPurpose" className="text-sm leading-relaxed">
            I understand that TubeAmp is for <strong>educational purposes only</strong> and does not provide investment advice, financial advice, or recommendations to buy or sell securities.
          </Label>
        </div>
        {errors.educationalPurpose && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {errors.educationalPurpose.message}
          </div>
        )}
      </div>

      {/* Terms and Privacy Policy */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="termsAccepted" 
            onCheckedChange={(checked) => setValue("termsAccepted", !!checked)}
            className={errors.termsAccepted ? "border-destructive" : ""}
          />
          <Label htmlFor="termsAccepted" className="text-sm leading-relaxed">
            I accept the{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        {errors.termsAccepted && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {errors.termsAccepted.message}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      {/* Risk Disclosure */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <strong>Risk Disclosure:</strong> Trading and investing involves substantial risk of loss. Past performance does not guarantee future results. This platform is for educational purposes only.
          </div>
        </div>
      </div>
    </form>
  );
}