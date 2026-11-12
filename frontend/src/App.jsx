import { useState, useEffect } from "react";
import { getHealthStatus, getTeamInfo, getProducts, createProduct, updateProduct, deleteProduct } from "./api";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";

export default function App() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const [healthStatus, setHealthStatus] = useState("")

  const [teamInfo, setTeamInfo] = useState(null);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      console.error("Failed to load products:", e);
    }
  }

  //tady něco píšu ↓↓↓↓↓↓

  async function loadHealthStatus(){
    try {
      const data = await getHealthStatus();
      if (data.status == "ok"){
        setHealthStatus("OK");
      }
      else{
        setHealthStatus("je tu chyba... AJÉJE!");
      } 
    } catch (e) {
      console.error("Failed to load healthStatus:", e);
      setHealthStatus("je tu chyba... AJÉJE!");
    }
  }


  async function loadTeamInfo(){
    try {
      const data = await getTeamInfo();
      setTeamInfo(data);
    } catch (e) {
      console.error("chyba při načítání týmu", e);
    }
  }

// tady něco píšu ^^^^^^^
  useEffect(() => {
    loadProducts();
    loadHealthStatus();
    loadTeamInfo();

  }, []);

  async function handleCreate(product) {
    await createProduct(product);
    loadProducts();
  }

  async function handleUpdate(id, product) {
    await updateProduct(id, product);
    setEditingProduct(null);
    loadProducts();
  }

  async function handleDelete(id) {
    await deleteProduct(id);
    loadProducts();
  }

  return (
    <div>
      
      <h1>Think different Academy</h1>
      <p>Status: {healthStatus}</p>
      {teamInfo && (
        <p>
          Team name: {teamInfo.team_name}
          Team members: {teamInfo.members}
        </p>
      )}
      
      <ProductForm
        onSubmit={editingProduct ? (p) => handleUpdate(editingProduct.id, p) : handleCreate}
        initial={editingProduct}
        onCancel={editingProduct ? () => setEditingProduct(null) : null}
      />

      <ProductTable
        products={products}
        onEdit={setEditingProduct}
        onDelete={handleDelete}
      />
    </div>
  );
}
