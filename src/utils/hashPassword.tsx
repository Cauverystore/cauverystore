import { useEffect } from "react";
import bcrypt from "bcryptjs";

export default function HashPasswordTool() {
  useEffect(() => {
    const run = async () => {
      const plainPassword = "yourAdminPassword"; // Replace with your real password
      const hashed = await bcrypt.hash(plainPassword, 10);
      console.log("Hashed Password:", hashed);
    };

    run();
  }, []);

  return (
    <div className="p-6 text-center text-sm text-gray-600">
      Open your browser console to copy the hashed password.
    </div>
  );
}
