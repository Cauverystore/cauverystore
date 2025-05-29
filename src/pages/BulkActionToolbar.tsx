// src/Components/BulkActionToolbar.tsx
interface Props {
  onSuspend: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}

export default function BulkActionToolbar({ onSuspend, onReactivate, onDelete }: Props) {
  return (
    <div className="flex gap-2 mb-4 p-2 border rounded bg-gray-50">
      <button
        onClick={onSuspend}
        className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-sm"
      >
        Suspend
      </button>
      <button
        onClick={onReactivate}
        className="px-3 py-1 rounded bg-green-100 text-green-800 text-sm"
      >
        Reactivate
      </button>
      <button
        onClick={onDelete}
        className="px-3 py-1 rounded bg-red-100 text-red-800 text-sm"
      >
        Archive
      </button>
    </div>
  );
}
