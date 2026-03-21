import { NotFound } from "@/components/custom/not-found";

export default function NotFoundPage() {
  return (
    <NotFound
      status={404}
      message="Page Not Found"
      description="The requested URL was not found on this server."
    />
  );
}
