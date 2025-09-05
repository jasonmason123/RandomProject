import { Product } from "@app/class/entities";
import { ContentHeader } from "@app/components";
import { fetchItemById } from "@app/services/api_caller/entity-api-caller";
import { FlagBoolean } from "@app/types/enums";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const apiName = "product";
const basePath = "products";

const ProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productFromState: Product = location.state?.product;
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product>(productFromState ?? new Product());

  const fetchData = async (productId: number) => {
    setLoading(true);
    try {
      const fetchedItem = await fetchItemById<Product>(productId, apiName);
      setProduct(fetchedItem);
    } catch (error) {
      alert("Error fetching product data. See console for details.");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    if (id && !productFromState) {
      const productId = Number(id);
      fetchData(productId);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center mt-5">
        <p className="text-danger">Product not found.</p>
      </div>
    );
  }

  return (
    <div>
      <ContentHeader title="Product Details" />
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Product Details</h3>
            </div>
            <div className="card-body">
              <p><strong>Product ID:</strong> {product.id}</p>
              <p><strong>Name:</strong> {product.name}</p>
              <p><strong>Description:</strong> {product.description}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Created At:</strong> {new Date(product.createdAt).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "—"}</p>
              <p><strong>Deleted:</strong> {product.flagDel === FlagBoolean.TRUE ? "Yes" : "No"}</p>
              <div className="text-right">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/${basePath}/${id}/edit`, { state: { product } })}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;