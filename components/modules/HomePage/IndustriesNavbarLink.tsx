import Link from "next/link";

export default function IndustriesNavbarLink() {
  return (
    <Link
      href="/industries"
      className="font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md"
    >
      Industries
    </Link>
  );
}
