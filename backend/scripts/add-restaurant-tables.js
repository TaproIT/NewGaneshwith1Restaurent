// Creates the dining tables for a restaurant. There is no screen for this, so run it once
// per restaurant from the backend folder (it uses MONGO_URI from backend/.env):
//
//   node scripts/add-restaurant-tables.js New 12            -> creates tables 1..12 for New Restaurant
//   node scripts/add-restaurant-tables.js New 12 --dry-run  -> only shows what it would create
//
// Each new table copies the name of the Beach restaurant's table with the same number, so the
// tables look the same as today. If Beach has no table with that number, the name is "Table <n>".
// Tables that already exist for the restaurant are skipped, so running it twice is safe.
import dotenv from "dotenv";
import mongoose from "mongoose";
import RestaurantTable from "../src/models/order/restaurant-table-model.js";
import { RestaurantTypes, TableStatuses } from "../src/utils/enums/order-related-enums.js";

dotenv.config();

const [restaurantType, countArg] = process.argv.slice(2);
const dryRun = process.argv.includes("--dry-run");
const validTypes = Object.values(RestaurantTypes).map((t) => t.value);
const count = Number(countArg);

if (!validTypes.includes(restaurantType) || !Number.isInteger(count) || count < 1 || count > 200) {
  console.log(`Usage: node scripts/add-restaurant-tables.js <${validTypes.join("|")}> <number of tables> [--dry-run]`);
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.log("MONGO_URI is not set (backend/.env).");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

try {
  const existing = await RestaurantTable.find({ restaurantType }).lean();
  const existingNumbers = new Set(existing.map((t) => t.tableNumber));
  const beachTables = await RestaurantTable.find({ restaurantType: RestaurantTypes.BEACH.value }).lean();
  const beachNameByNumber = new Map(beachTables.map((t) => [t.tableNumber, t.name]));

  const toCreate = [];
  for (let n = 1; n <= count; n++) {
    if (existingNumbers.has(n)) continue;
    toCreate.push({
      name: beachNameByNumber.get(n) ?? `Table ${n}`,
      tableNumber: n,
      status: TableStatuses.EMPTY.value,
      restaurantType,
    });
  }

  console.log(`${restaurantType}: ${existing.length} table(s) already exist, ${toCreate.length} to create.`);
  toCreate.forEach((t) => console.log(`  #${t.tableNumber}  ${t.name}`));

  if (!dryRun && toCreate.length > 0) {
    await RestaurantTable.insertMany(toCreate);
    console.log("Done.");
  } else if (dryRun) {
    console.log("Dry run: nothing was written.");
  }
} finally {
  await mongoose.disconnect();
}
