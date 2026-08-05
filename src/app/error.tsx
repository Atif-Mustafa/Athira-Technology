"use client";

import { useEffect } from "react";
import { Button } from "../components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <h2 className="text-4xl font-bold text-white mb-6">Something went wrong!</h2>
      <Button onClick={() => reset()} size="lg">
        Try again
      </Button>
    </div>
  );
}
