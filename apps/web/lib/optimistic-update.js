export async function runOptimisticUpdate({ snapshot, apply, commit, rollback, onError }) {
  apply();

  try {
    return await commit();
  } catch (error) {
    rollback(snapshot);

    if (onError) {
      onError(error);
    }

    throw error;
  }
}
