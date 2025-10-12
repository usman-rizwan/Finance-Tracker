import Link from "next/link";
import { 
  TrendingUp, 
  Home, 
  ArrowLeft, 
  Search,
  Calculator,
  PieChart,
  BarChart3
} from "lucide-react";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 with Financial Icons */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text mb-4">
            404
          </div>
          
          {/* Floating Financial Icons */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-32">
              <div className="absolute top-4 left-1/4 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center animate-bounce delay-100">
                <Calculator className="w-6 h-6 text-purple-600" />
              </div>
              <div className="absolute top-8 right-1/4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-bounce delay-300">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="absolute bottom-4 left-1/3 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center animate-bounce delay-500">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Looks like this page went on a spending spree and disappeared!
          </p>
          <p className="text-gray-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-6 py-3"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Search Suggestion */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Looking for something specific?
          </h3>
          <p className="text-gray-600 mb-4">
            Try navigating to one of these popular sections:
          </p>
          
          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link 
              href="/dashboard" 
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-center group"
            >
              <Home className="w-5 h-5 text-gray-600 group-hover:text-purple-600 mx-auto mb-1" />
              <span className="text-sm text-gray-700 group-hover:text-purple-700">Dashboard</span>
            </Link>
            
            <Link 
              href="/add-expense" 
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-center group"
            >
              <Calculator className="w-5 h-5 text-gray-600 group-hover:text-purple-600 mx-auto mb-1" />
              <span className="text-sm text-gray-700 group-hover:text-purple-700">Add Expense</span>
            </Link>
            
            <Link 
              href="/analytics" 
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-center group"
            >
              <BarChart3 className="w-5 h-5 text-gray-600 group-hover:text-purple-600 mx-auto mb-1" />
              <span className="text-sm text-gray-700 group-hover:text-purple-700">Analytics</span>
            </Link>
            
            <Link 
              href="/activity" 
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-center group"
            >
              <PieChart className="w-5 h-5 text-gray-600 group-hover:text-purple-600 mx-auto mb-1" />
              <span className="text-sm text-gray-700 group-hover:text-purple-700">Activity</span>
            </Link>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 flex items-center justify-center space-x-2 text-gray-500">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm">Finance Tracker - Smart Expense Management</span>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
    </div>
  );
}