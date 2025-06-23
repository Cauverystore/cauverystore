import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import SectionHeader from "@/components/SectionHeader";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Cauverystore – Discover Unique Local Products</title>
        <meta
          name="description"
          content="Shop authentic, locally-sourced products from across India. Support small businesses and artisans on Cauverystore."
        />
      </Helmet>

      <div className="space-y-8">
        <PageHeader
          title="Welcome to Cauverystore"
          subtitle="India’s marketplace for local treasures"
        />

        <SectionHeader title="Start Shopping" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <SectionCard
            title="Browse Products"
            description="Explore our curated collection from verified sellers."
            to="/storefront"
          />
          <SectionCard
            title="Categories"
            description="Discover new and trending product categories."
            to="/categories"
          />
          <SectionCard
            title="My Wishlist"
            description="Easily save products you love."
            to="/wishlist"
          />
        </div>

        <SectionHeader title="For You" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SectionCard
            title="My Orders"
            description="Track purchases, view receipts, and submit reviews."
            to="/my-orders"
          />
          <SectionCard
            title="Profile Settings"
            description="Update your personal info and preferences."
            to="/profile"
          />
        </div>

        <SectionHeader title="Need Help?" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SectionCard
            title="Support"
            description="Raise support tickets or ask for help."
            to="/support"
          />
          <SectionCard
            title="FAQs"
            description="Read frequently asked questions about shopping on Cauverystore."
            to="/faq"
          />
        </div>

        <div className="text-center text-sm text-muted-foreground mt-10">
          Made with ❤️ by Cauverystore
        </div>
      </div>
    </>
  );
};

export default Home;
