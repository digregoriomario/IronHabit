import { Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";

import { DIFFICULTIES, EQUIPMENT, MUSCLE_GROUPS } from "../../domain/constants";
import { filterExercises } from "../../usecases/filterUseCases";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { EmptyState } from "../components/EmptyState";
import { FiltersPanel } from "../components/FiltersPanel";
import { IconButton } from "../components/IconButton";
import { ListRow } from "../components/ListRow";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors } from "../theme/colors";
import { exerciseSortOptions } from "../utils/labels";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function ExerciseListScreen({ navigation }) {
  const exercises = useIronHabitStore((state) => state.exercises);
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("Tutti");
  const [difficulty, setDifficulty] = useState("Tutti");
  const [equipment, setEquipment] = useState("Tutti");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(
    () => filterExercises(exercises, { query, muscle, difficulty, equipment, sort }),
    [exercises, query, muscle, difficulty, equipment, sort]
  );
  const activeFilters = [muscle !== "Tutti", difficulty !== "Tutti", equipment !== "Tutti", sort !== "name"].filter(Boolean).length;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <PageHeader
          title="Esercizi"
          action={<IconButton icon={Plus} label="Crea esercizio" color={colors.info} onPress={() => navigation.navigate("ExerciseForm")} />}
        />

        <AppInput value={query} onChangeText={setQuery} placeholder="Cerca per nome o descrizione" className="mb-3" />
        <FiltersPanel activeCount={activeFilters}>
          <AppSelect label="Gruppo" options={["Tutti", ...MUSCLE_GROUPS]} value={muscle} onChange={setMuscle} />
          <AppSelect label="Difficolta" options={["Tutti", ...DIFFICULTIES]} value={difficulty} onChange={setDifficulty} />
          <AppSelect label="Attrezzatura" options={["Tutti", ...EQUIPMENT]} value={equipment} onChange={setEquipment} />
          <AppSelect label="Ordina" options={exerciseSortOptions} value={sort} onChange={setSort} />
        </FiltersPanel>

        {filtered.length ? (
          filtered.map((exercise) => (
            <ListRow
              key={exercise.id}
              title={exercise.name}
              subtitle={`${exercise.primaryMuscle} - ${exercise.difficulty} - ${exercise.equipment}`}
              meta={exercise.recommendedReps || `${exercise.estimatedDuration} min stimati`}
              onPress={() => navigation.navigate("ExerciseDetail", { id: exercise.id })}
            />
          ))
        ) : (
          <EmptyState
            title="Nessun esercizio trovato"
            message="Modifica filtri o crea un nuovo esercizio."
            action={<AppButton title="Crea esercizio" variant="info" onPress={() => navigation.navigate("ExerciseForm")} />}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
