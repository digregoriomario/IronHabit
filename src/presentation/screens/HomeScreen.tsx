import { PlaceholderCard } from "../components/PlaceholderCard";
import { ScreenLayout } from "../components/ScreenLayout";

export function HomeScreen() {
  return (
    <ScreenLayout
      title="Home"
      subtitle="Qui troverai il calendario settimanale e lo storico delle tue attività."
    >
      <PlaceholderCard
        icon="calendar-blank-outline"
        title="Planner settimanale"
        description="La pianificazione delle sessioni verrà aggiunta nei prossimi aggiornamenti."
      />
    </ScreenLayout>
  );
}
