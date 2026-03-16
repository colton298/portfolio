import StarSurvivorsClient from "./StarSurvivorsClient";

export const metadata = {
  title: "CS - Star Survivors",
};

export default function StarSurvivorsPage() {
  return (
    <main className="min-h-screen">
      <StarSurvivorsClient />
    </main>
  );
}
