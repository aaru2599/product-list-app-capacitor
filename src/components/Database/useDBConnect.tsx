import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { useEffect, useRef, useState } from "react";

const useDBConnect = () => {
    const db = useRef<SQLiteDBConnection>();
    const sqlite = useRef<SQLiteConnection>();
    const [initializedDB, setInitializedDb] = useState<boolean>(false);
    const [isDBConnected, setIsDBConnected] = useState<boolean>(false);

    useEffect(() => {
        const initializeDB = async () => {
            try {
                if (sqlite.current) return;

                sqlite.current = new SQLiteConnection(CapacitorSQLite);
                const response = await sqlite.current.checkConnectionsConsistency();
                console.log("checkConnectionsConsistency response:", response);

                const isConnect = (await sqlite.current.isConnection("productsDB", false)).result;
                console.log("isConnection result:", isConnect);

                if (response.result && isConnect) {
                    db.current = await sqlite.current.retrieveConnection("productsDB", false);
                    console.log("Retrieved existing connection");
                } else {
                    db.current = await sqlite.current.createConnection(
                        "productsDB", false, "no-encryption", 1, false
                    );
                    console.log("Created new connection");
                }

                setIsDBConnected(true);
            } catch (error) {
                console.error("Database initialization error:", error);
                setIsDBConnected(false);
            }
        };

        initializeDB().then(() => {
            initializeProductTable();
            setInitializedDb(true);
        }).catch((error) => {
            console.error("Database initialization failed:", error);
            setIsDBConnected(false);
        });
    }, []);

    const performSQLAction = async (
        action: (db: SQLiteDBConnection | undefined) => Promise<void>,
        cleanup?: () => Promise<void>
    ) => {
        try {
            await db.current?.open();
            console.log("Database opened");
            await action(db.current);
        } catch (err) {
            console.error("performSQLAction error:", err);
            alert((err as Error).message);
        } finally {
            try {
                (await db.current?.isDBOpen())?.result && (await db.current?.close());
                cleanup && (await cleanup());
            } catch (err) {
                console.error("Error during cleanup:", err);
            }
        }
    };

    const initializeProductTable = async () => {
        await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS products(
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                image TEXT NOT NULL
            );
            `;
            try {
                const responseTable = await db?.execute(createTableQuery);
                console.log("Table creation response:", responseTable);
            } catch (error) {
                console.error("Table creation failed:", error);
            }
        });
    };

    return { performSQLAction, isDBConnected, initializedDB };
};

export default useDBConnect;
