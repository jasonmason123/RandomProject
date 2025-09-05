import ContentHeader from "@app/components/content-header/ContentHeader";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { Product } from "@app/class/entities";
import { addItem, deleteItem, fetchItemById, fetchItems, updateItem } from "@app/services/api_caller/entity-api-caller";

const apiName = "product";
const basePath = "products";

const ProductAddEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productFromState: Product = location.state?.product;
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product>(productFromState ?? new Product());

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: product,
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      description: Yup.string().required("Description is required"),
      price: Yup.number()
        .required("Price is required")
        .positive("Price must be greater than zero"),
    }),
    onSubmit: async (values) => {
      if (id) {
        await updateProduct(Number(id), values);
      } else {
        await addProduct(values);
      }
    },
  });

  const addProduct = async (product: Product) => {
    if(!window.confirm("Are you sure you want to add this product?")) {
      return;
    }

    try {
      setLoading(true);
      const newProductId = await addItem<Product>(product, apiName);
      alert("Product added");
      navigate(`/${basePath}/${newProductId}`, { state: { product } });
    } catch (error) {
      alert("Error adding product. See console for details.");
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
  }

  const updateProduct = async (id: number, product: Product) => {
    if(!window.confirm("Are you sure you want to update this product?")) {
      return;
    }

    try {
      setLoading(true);
      const updatedProduct = await updateItem<Product>(id, product, apiName);
      alert("Product updated");
      navigate(`/${basePath}/${id}`, { state: { product } });
    } catch (error) {
      alert("Error updating product. See console for details.");
      console.error("Error updating product:", error);
    } finally {
      setLoading(false);
    }
  }

  const deleteProduct = async (id: number) => {
    if(!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteItem(id, apiName);
      alert("Product deleted");
      navigate(`/${basePath}`);
    } catch (error) {
      alert("Error deleting product. See console for details.");
      console.error("Error deleting product:", error);
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div>
      <ContentHeader title={id ? "Edit Product" : "New Product"} />
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                {id ? `Edit Product (ID: ${id})` : "Add New Product"}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={formik.handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`form-control ${
                      formik.touched.name && formik.errors.name
                        ? "is-invalid"
                        : ""
                    }`}
                    disabled={loading}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="invalid-feedback">
                      {formik.errors.name}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">
                    Price
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    className={`form-control ${
                      formik.touched.price && formik.errors.price
                        ? "is-invalid"
                        : ""
                    }`}
                    disabled={loading}
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.price && formik.errors.price && (
                    <div className="invalid-feedback">
                      {formik.errors.price}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`form-control ${
                      formik.touched.description && formik.errors.description
                        ? "is-invalid"
                        : ""
                    }`}
                    disabled={loading}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="invalid-feedback">
                      {formik.errors.description}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="text-right">
                  {id && (
                    <button
                      type="button"
                      className="btn btn-danger mr-2"
                      onClick={() => deleteProduct(Number(id))}
                    >
                      Delete
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductAddEdit;