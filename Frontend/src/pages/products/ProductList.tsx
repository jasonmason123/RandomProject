import { ContentHeader } from "@app/components";
import EntityTable from "@app/components/table/EntityTable";
import { Product } from "@app/class/entities";

const ProductList = () => {
  return (
    <div>
      <ContentHeader title="Products" />
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Products</h3>
            </div>
            <div className="card-body">
              <EntityTable<Product>
                pageSize={10}
                apiName="product"
                displayFields={["id", "name", "price", "flagDel"]}
                sortFields={["id", "price", "flagDel"]}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductList;