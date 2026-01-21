import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlayCircle, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // For now, show a simple welcome page
  // Later you can fetch courses from the API

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">MVP Course Platform</h1>
            {isAuthenticated ? (
              <span className="text-sm text-gray-600">Welcome, {user?.name || "User"}</span>
            ) : (
              <span className="text-sm text-gray-500">Guest Mode</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Learn with AI-Powered Assistance
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Interactive video lessons with AI tutor to help you understand better
          </p>
        </div>

        {/* Demo Course Card */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-white" />
              </div>
              <CardTitle>Achieve More With GenAI</CardTitle>
              <CardDescription>
                Learn how to leverage generative AI to boost your productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <BookOpen className="w-4 h-4" />
                <span>5 Modules • 10 Lessons</span>
              </div>
              <Link href="/course/demo/lesson/1">
                <Button className="w-full">Start Learning</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center text-gray-500">
          <p>Run <code className="bg-gray-100 px-2 py-1 rounded">pnpm db:seed</code> to populate sample course data</p>
        </div>
      </main>
    </div>
  );
}
