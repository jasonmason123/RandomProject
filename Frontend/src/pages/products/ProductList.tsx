import { ContentHeader } from "@app/components";
import AutoTable from "@app/components/table/AutoTable";
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
              <AutoTable
                entityClass={Product}
                pageSize={10}
                displayFields={["id", "name", "price"]}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductList;