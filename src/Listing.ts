import { getClient } from "./utils/Login";

async function main() {
  const client = await getClient();

  // ここにすきなAPIをかく
  const items = await client.folders.getItems("0");
  for (const e of items.entries) {
    console.log(e.id, e.name);
  }
}

main()
  .then(() => {
    console.log("main done!");
  })
  .catch(console.error);
