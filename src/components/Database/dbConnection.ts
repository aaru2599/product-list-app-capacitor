import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

// jeepSqlite(window)
 const sqlite = new SQLiteConnection(CapacitorSQLite);

export async function createDatabase() {
  try {
   
    // await customElements.whenDefined('jeep-sqlite');
    // await customElements.whenDefined('jeep-sqlite');
    // console.log("jeep connect");
    
    const db = await sqlite.createConnection(
        "productsDB",
        false,
        "no-encryption",
        1,
        true
    );
    await db.open();
    console.log("Connection done");
   
    await db.execute(`
            CREATE TABLE IF NOT EXISTS products(
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            image TEXT NOT NULL,
            ) 
        `);
    await db.execute(`
            CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            image TEXT NOT NULL,
            )
            `);
    await sqlite.closeConnection("productsDB", false);
  } catch (error) {
    console.error(error);
  }
}

export { sqlite };
