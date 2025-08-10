import { TrendingUp, BarChart3, PieChart, Wallet } from "lucide-react";
import { SignInForm } from "~/components/auth/SignInForm";

export const metadata = {
  title: "Sign In",
  description: "Sign in to FinanceTracker",
};


export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <TrendingUp className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">FinanceTracker</h1>
            <p className="text-xl text-white/90 text-center max-w-md">
              Take control of your finances with smart expense tracking and insights
            </p>
          </div>
          
          {/* Illustration Elements */}
          <div className="flex space-x-6 mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <PieChart className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium mb-2">You are just a few steps away</p>
            <p className="text-white/80">from better financial management</p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <SignInForm />
      </div>
    </div>
  );
}