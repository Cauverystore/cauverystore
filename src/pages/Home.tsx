import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Sparkles, ShoppingCart, TrendingUp } from "lucide-react";
import { useDarkMode } from "@/store/darkModeStore";

const Home = () => {
  const { dark } = useDarkMode();

  return (
    <>
      <Helmet>
        <title>Cauverystore - Home</title>
        <meta
          name="description"
          content="Welcome to Cauverystore - Discover trending products, shop securely, and enjoy exclusive deals."
        />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Cauverystore - Shop Natural, Support Local" />
        <meta
          property="og:description"
          content="Your one-stop shop for curated natural products. Start shopping and support local merchants today!"
        />
        <meta property="og:image" content="https://cauverystore.in/og-image.jpg" />
        <meta property="og:url" content="https://cauverystore.in/" />
        <meta property="og:type" content="website" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cauverystore - Shop Natural, Support Local" />
        <meta
          name="twitter:description"
          content="Discover quality herbal products and support local merchants with every purchase."
        />
        <meta name="twitter:image" content="https://cauverystore.in/og-image.jpg" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-12 md:px-10 lg:px-20">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 dark:text-green-400">
            Welcome to Cauverystore
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Your one-stop shop for quality products, curated collections, and unbeatable deals. 
            Explore categories, shop with ease, and support local merchants.
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link to="/store">
              Start Shopping
            </Link>
          </Button>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <Card className="hover:shadow-lg transition">
            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
              <Sparkles className="w-10 h-10 text-green-500" />
              <h2 className="text-lg font-semibold">Curated Products</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Discover hand-picked products that meet quality and affordability standards.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
              <ShoppingCart className="w-10 h-10 text-green-500" />
              <h2 className="text-lg font-semibold">Seamless Shopping</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Add to cart, checkout, track orders — all with a smooth and secure experience.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
              <TrendingUp className="w-10 h-10 text-green-500" />
              <h2 className="text-lg font-semibold">Support Local Merchants</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Every purchase helps small businesses grow — thank you for shopping local.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Browse Our Collections Now</h2>
          <Button asChild variant="outline">
            <Link to="/store">
              Visit Storefront
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
};

export default Home;
