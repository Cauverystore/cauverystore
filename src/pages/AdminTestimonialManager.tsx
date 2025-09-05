import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import toast from "react-hot-toast";

interface Testimonial {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export default function AdminTestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("testimonials").select("*");
    if (error) setError("Failed to fetch testimonials");
    else setTestimonials(data || []);
    setLoading(false);
  };

  const addTestimonial = async () => {
    if (!name.trim() || !message.trim()) return;
    const { error } = await supabase.from("testimonials").insert([{ name, message }]);
    if (!error) {
      toast.success("Testimonial added");
      setName("");
      setMessage("");
      fetchTestimonials();
    } else toast.error("Failed to add testimonial");
  };

  const deleteTestimonial = async (id: string) => {
    const confirm = window.confirm("Delete this testimonial?");
    if (!confirm) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (!error) {
      toast.success("Deleted");
      fetchTestimonials();
    } else toast.error("Delete failed");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Admin Testimonials | Cauverystore</title>
        <meta name="description" content="Manage customer testimonials." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Testimonial Management</h1>

      <div className="space-y-3 mb-6">
        <Input
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={addTestimonial}>Add Testimonial</Button>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : testimonials.length === 0 ? (
        <p>No testimonials found.</p>
      ) : (
        <ul className="space-y-4">
          {testimonials.map((t) => (
            <li
              key={t.id}
              className="border p-4 rounded bg-white shadow-sm dark:bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{t.message}</p>
                </div>
                <button
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => deleteTestimonial(t.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
