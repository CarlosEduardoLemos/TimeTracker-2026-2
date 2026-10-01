export function totalSeconds(summary) {
  return summary?.users?.reduce((sum, user) => sum + user.total_seconds, 0) || 0;
}

export function categoryTotals(summary) {
  const totals = new Map();
  for (const user of summary?.users || []) {
    for (const category of user.by_category) {
      totals.set(category.category, (totals.get(category.category) || 0) + category.total_seconds);
    }
  }
  return [...totals.entries()]
    .map(([name, seconds]) => ({ name, seconds }))
    .sort((first, second) => second.seconds - first.seconds);
}
