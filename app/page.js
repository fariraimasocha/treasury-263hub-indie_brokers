import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      Treasury Landing Page
      <Link href="/auth/signIn">
        <Button variant="outline">Register</Button>
      </Link>
    </div>
  );
}
