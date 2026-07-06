export type ExerciseGroup<T> = {
  isSuperset: boolean;
  items: T[];
};

// Groups consecutive exercises that share a superset_group.
export function groupBySuperset<T extends { superset_group: number | null }>(
  exercises: T[]
): ExerciseGroup<T>[] {
  const groups: ExerciseGroup<T>[] = [];
  for (const se of exercises) {
    const last = groups[groups.length - 1];
    if (
      last &&
      se.superset_group !== null &&
      last.items[0].superset_group === se.superset_group
    ) {
      last.items.push(se);
      last.isSuperset = true;
    } else {
      groups.push({ isSuperset: false, items: [se] });
    }
  }
  return groups;
}
