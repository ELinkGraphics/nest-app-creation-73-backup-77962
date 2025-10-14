import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppNav } from "@/hooks/useAppNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { navigateToTab } = useAppNav();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: formData.fullName,
            full_name: formData.fullName,
          }
        }
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to MomsNest!",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tertiary/30 via-background to-secondary/20 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateToTab("home")}
            className="absolute top-6 left-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="inline-flex items-center rounded-full px-3 py-1 border border-gray-200">
            <img 
              src="/lovable-uploads/0cbbe835-9c4c-4a9c-87ae-8385aa0d34ee.png" 
              alt="MomsNest" 
              className="h-8 w-auto"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Join MomsNest</h1>
            <p className="text-sm text-muted-foreground mt-1">Create your account</p>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your name"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="h-10 bg-gray-50 border-gray-200 focus:border-primary focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="h-10 bg-gray-50 border-gray-200 focus:border-primary focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="h-10 pr-10 bg-gray-50 border-gray-200 focus:border-primary focus:bg-white"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="h-10 pr-10 bg-gray-50 border-gray-200 focus:border-primary focus:bg-white"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create account
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary/80 font-medium transition-colors story-link"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}