import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import toast from "react-hot-toast";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function AdminFAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("faqs").select("*");
    if (error) setError("Failed to fetch FAQs");
    else setFaqs(data || []);
    setLoading(false);
  };

  const addFAQ = async () => {
    if (!question.trim() || !answer.trim()) return;
    const { error } = await supabase.from("faqs").insert([{ question, answer }]);
    if (!error) {
      toast.success("FAQ added");
      setQuestion("");
      setAnswer("");
      fetchFAQs();
    } else toast.error("Failed to add FAQ");
  };

  const deleteFAQ = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this FAQ?");
    if (!confirm) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (!error) {
      toast.success("Deleted");
      fetchFAQs();
    } else toast.error("Delete failed");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Admin FAQ Manager | Cauverystore</title>
        <meta name="description" content="Manage frequently asked questions for customers." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">FAQ Management</h1>

      <div className="space-y-3 mb-6">
        <Input
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Input
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <Button onClick={addFAQ}>Add FAQ</Button>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : faqs.length === 0 ? (
        <p>No FAQs found.</p>
      ) : (
        <ul className="space-y-4">
          {faqs.map((faq) => (
            <li
              key={faq.id}
              className="border p-4 rounded bg-white shadow-sm dark:bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Q: {faq.question}</p>
                  <p className="text-gray-700 dark:text-gray-300">A: {faq.answer}</p>
                </div>
                <button
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => deleteFAQ(faq.id)}
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
