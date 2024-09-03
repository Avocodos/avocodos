import AddRewardForm from "@/components/forms/AddRewardForm";

export default function AddRewardPage() {
  return (
    <main className="container mx-auto max-w-7xl py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h3 className="mb-8 text-3xl font-bold tracking-tight">
          Add New Reward
        </h3>
        <AddRewardForm />
      </div>
    </main>
  );
}
