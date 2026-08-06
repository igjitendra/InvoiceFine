import { getDatabase } from "@/db/database";
type Row = { item_id: string };
export async function listFavoriteItemIds(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Row>(
    "SELECT item_id FROM item_favorites ORDER BY created_at DESC",
  );
  return rows.map((row) => row.item_id);
}
export async function setItemFavorite(
  itemId: string,
  favorite: boolean,
): Promise<void> {
  const db = await getDatabase();
  if (favorite) {
    await db.runAsync(
      "INSERT INTO item_favorites(item_id,created_at)VALUES(?,?) ON CONFLICT(item_id)DO NOTHING",
      itemId,
      new Date().toISOString(),
    );
  } else {
    await db.runAsync("DELETE FROM item_favorites WHERE item_id=?", itemId);
  }
}
