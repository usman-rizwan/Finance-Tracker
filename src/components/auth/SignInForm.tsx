"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";
import { signInSchema, type SignInFormData } from "~/lib/validation-schemas";
import { useAuth } from "~/contexts/AuthContext";

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await authClient.signIn.email({ 
        email: data.email, 
        password: data.password 
      });
      
      if (res.error) {
        setError(res.error.message || "Failed to sign in");
      } else if (res.data?.user) {
        // Immediately set user state to prevent redirect loop
        setUser({
          id: res.data.user.id,
          email: res.data.user.email || "",
          name: res.data.user.name || "",
        });
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">Log in to start your session</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-purple-700">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              {...register("email")}
              className={`pl-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg ${
                errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-purple-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your Password"
              {...register("password")}
              className={`pl-12 pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg ${
                errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>LOG IN</span>
            </div>
          ) : (
            "LOG IN"
          )}
        </Button>

        {/* <div className="text-center ">
          <Link
            href="/forgot-password"
            className="text-gray-500 hover:text-purple-600 transition-colors text-sm "
          >
            Forgot your Password?
          </Link>
        </div> */}

        <div className="text-center">
          <span className="text-gray-500 text-sm">OR</span>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
