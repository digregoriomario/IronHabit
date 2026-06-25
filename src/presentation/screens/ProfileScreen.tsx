import { PlaceholderCard } from "../components/PlaceholderCard";
import { ScreenLayout } from "../components/ScreenLayout";

export function ProfileScreen() {
  return (
    <ScreenLayout
      title="Profilo"
      subtitle="Statistiche personali, obiettivi e progressi saranno raccolti qui."
    >
      <PlaceholderCard
        icon="chart-line"
        title="I tuoi progressi"
        description="I grafici e gli indicatori verranno collegati ai workout registrati."
      />
    </ScreenLayout>
  );
}
