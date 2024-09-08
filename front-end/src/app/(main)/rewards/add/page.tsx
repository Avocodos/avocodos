import AddRewardForm from "@/components/forms/AddRewardForm";

export default function AddRewardPage() {
  return (
    <main className="mr-auto mt-4 w-full max-w-7xl pb-16">
      <div className="mr-auto flex max-w-2xl flex-col gap-4">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">
          Add New Reward
        </h2>
        <AddRewardForm />
      </div>
    </main>
  );
}
