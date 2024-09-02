import AddCommunityForm from "@/components/forms/AddCommunityForm";

export default function CreateCommunityPage() {
  return (
    <div className="max-w-2xl pb-16 pt-5">
      <h2 className="mb-4 text-2xl font-bold">Create a New Community</h2>
      <AddCommunityForm />
    </div>
  );
}
