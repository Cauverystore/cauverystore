import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Cauverystore</title>
        <meta name="description" content="Sorry, the page you are looking for does not exist." />
      </Helmet>

      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center space-y-6">
            <h1 className="text-5xl font-bold text-green-600">404</h1>
            <p className="text-xl font-medium">Oops! Page not found</p>
            <p className="text-gray-600 dark:text-gray-400">
              The page you are looking for might have been removed or is temporarily unavailable.
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NotFoundPage;
