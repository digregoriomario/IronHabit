import { PlaceholderCard } from "../components/PlaceholderCard";
import { ScreenLayout } from "../components/ScreenLayout";

export function WorkoutScreen() {
  return (
    <ScreenLayout
      title="Allenamento"
      subtitle="Il punto di partenza per creare schede e avviare una sessione."
    >
      <PlaceholderCard
        icon="clipboard-text-outline"
        title="Le mie schede"
        description="In questa sezione verranno mostrate le routine salvate dall'utente."
      />
    </ScreenLayout>
  );
}
