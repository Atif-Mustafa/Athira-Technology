import Link from "next/link";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Page Not Found</h2>
      <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>
      <Button asChild size="lg">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
