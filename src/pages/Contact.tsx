// src/pages/Contact.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "contact_form_view");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      message,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Message sent successfully!");
      setName("");
      setEmail("");
      setMessage("");

      // ✅ GA4 contact form submit event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "contact_form_submit", {
          name,
          email,
        });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Helmet>
        <title>Contact Us | Cauverystore</title>
        <meta
          name="description"
          content="Reach out to the Cauverystore team with your questions or feedback."
        />
        <meta property="og:title" content="Contact Us | Cauverystore" />
        <meta
          property="og:description"
          content="Have questions? Contact the Cauverystore team."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cauverystore.in/contact" />
        <meta name="twitter:title" content="Contact Us | Cauverystore" />
        <meta
          name="twitter:description"
          content="Submit your queries or feedback to the Cauverystore support team."
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Contact Us</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Message</label>
          <textarea
            className="w-full border rounded p-2 min-h-[120px] dark:bg-gray-700 dark:text-white"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
        >
          {loading ? "Sending..." :
