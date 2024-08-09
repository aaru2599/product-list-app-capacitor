import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonImg, IonItem, IonLabel, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import useDBConnect from '../components/Database/useDBConnect';

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

const ProductLayout: React.FC = () => {
  const [products, setProducts] = useState<Array<Product>>([]);
  const [cart, setCart] = useState<Array<Product>>([]);
  const { initializedDB, isDBConnected, performSQLAction } = useDBConnect();
  const [tableData, setTableData] = useState<any>({});
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    if (initializedDB) {
      fetchProducts();
      checkTables();
    }
  }, [initializedDB]);
  console.log(tableData, tables);

  const fetchProducts = async () => {
    try {
      const responce = await axios.get('https://fakestoreapi.com/products');
      const productsData: Product[] = await responce.data;
      setProducts(productsData)

      await performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.execute('BEGIN TRANSACTION');
          console.log("Fetched products data:", productsData); // Log fetched products data
          for (const product of productsData) {
            await db?.run(`INSERT OR IGNORE INTO products (id, title, price, description, category, image) VALUES (?, ?, ?, ?, ?, ?);`, [
              product.id,
              product.title,
              product.price,
              product.description,
              product.category,
              product.image,
            ]);
          }
          await db?.execute('COMMIT');
          console.log("Products inserted into the database."); // Log after insertion
        }
      );


    } catch (err) {
      console.error("Error fetching or inserting products:", err); // Log any errors
      alert((err as Error).message);
    }
  };

  const getProduct = async () => {
    await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
      const dbProducts = await db?.query(`SELECT * FROM products`);
      console.log("dbProducts", dbProducts);

      if (dbProducts && dbProducts.values) {
        setProducts(dbProducts.values as Product[]);
        console.log("Products retrieved from the database:", dbProducts.values); // Log retrieved products
      } else {
        console.log("No products found in the database."); // Log if no products found
      }
    });

  }


  const checkTables = async () => {
    try {
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respTables = await db?.query(`SELECT name FROM sqlite_master WHERE type='table'`);
        const tableNames = respTables?.values?.map((table: { name: string }) => table.name) ?? [];
        setTables(tableNames);

        console.log("Table names:", tableNames);

        // Fetch data from each table
        const data: any = {};
        for (const table of tableNames) {
          const respData = await db?.query(`SELECT * FROM ${table}`);
          data[table] = respData?.values ?? [];
        }
        setTableData(data);

        console.log("Table data:", data);
      });
    } catch (error) {
      console.error("Error fetching table information:", error);
    }
  };

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  console.log("Products state:", products); // Log the products state

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Products Layout</IonTitle>
          <IonButton slot="end" routerLink="/cart">Go to Cart</IonButton>
          <IonButton slot="end" onClick={() => getProduct()} >GetProducts</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* <IonGrid>
          <IonRow>
            {products.length > 0 && products.map(product => (
              <IonCol key={product.id} size="6" size-md="4" size-lg="2">
                <IonItem>
                  <IonLabel>
                    <IonImg src={product.image} style={{ height: "200px", objectFit: "cover" }} />
                    <h2 style={{ height: "40px", overflow: "hidden" }}>{product.title}</h2>
                    <p>Category: {product.category}</p>
                    <p>Price: ${product.price}</p>
                    <IonButton color="primary" onClick={() => addToCart(product)}>Add to Cart</IonButton>
                  </IonLabel>
                </IonItem>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid> */}
        <div>
          {isDBConnected ? <div>Database connected</div> : <div>Database not  connected</div>}
        </div>
        {initializedDB && (
          <p>The database has been initialized.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductLayout;
