import { Suspense } from "react";
import BookPage from "./BookClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">...</p>}>
      <BookPage />
    </Suspense>
  );
}
