interface BadgeProps {
  label: string;
  type?: "role" | "status" | "action";
}

export default function Badge({ label, type = "status" }: BadgeProps) {
  let classes = "px-2 py-1 text-xs font-medium rounded-full";

  if (type === "role") {
    classes +=
      label === "admin"
        ? " bg-blue-100 text-blue-800"
        : label === "merchant"
        ? " bg-yellow-100 text-yellow-800"
        : " bg-gray-100 text-gray-800";
  }

  if (type === "status") {
    classes +=
      label === "suspended"
        ? " bg-red-100 text-red-800"
        : " bg-green-100 text-green-800";
  }

  if (type === "action") {
    classes +=
      label === "suspend"
        ? " bg-yellow-100 text-yellow-800"
        : label === "reactivate"
        ? " bg-green-100 text-green-800"
        : " bg-red-100 text-red-800";
  }

  return <span className={classes}>{label}</span>;
}
