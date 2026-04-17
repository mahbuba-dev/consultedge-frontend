export default function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 opacity-70">
      <img src="/empty.svg" className="w-40 h-40 mb-4 opacity-80" />
      <p className="text-gray-600 text-lg">{title}</p>
    </div>
  );
}
