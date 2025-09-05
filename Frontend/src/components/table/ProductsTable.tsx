import { Product } from "@app/class/entities";
import { fetchItems } from "@app/services/api_caller/entity-api-caller";
import { PagedListResult } from "@app/types/dtos";
import { ProductQueryParams } from "@app/types/query-params";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, ButtonGroup, Form, Table } from "react-bootstrap";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 1;

const ProductsTable = () => {
  const [data, setData] = useState<PagedListResult<Product>>({
    items: [],
    pageCount: 0,
    pageNumber: DEFAULT_PAGE_NUMBER,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItemCount: 0
  });
  const [queryParams, setQueryParams] = useState<ProductQueryParams>({
    pageNumber: data.pageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
    searchTerm: ""
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startIdx, setStartIdx] = useState(1);
  const [endIdx, setEndIdx] = useState(1);
  
  useEffect(() => {
    fetchData();
  }, [queryParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedList = await fetchItems<Product>(queryParams, "product");

      // update state after fetching
      setData(fetchedList);
      setStartIdx((queryParams.pageNumber - 1) * queryParams.pageSize + 1);
      setEndIdx(Math.min(queryParams.pageNumber * queryParams.pageSize, fetchedList.totalItemCount));
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({
      ...prev,
      pageNumber: page
    }));
  };

  const handleSearchConfirm = (search: string) => {
    setQueryParams(prev => ({
      ...prev,
      pageNumber: 1,
      searchTerm: search
    }));
  };

  const handleExport = (format: string) => {
    alert(`Exporting as ${format}...`);
  };

  const onHeaderClick = (field: string) => {
    setQueryParams(prev => ({
      ...prev,
      sortBy: {
        property: field,
        order: prev.sortBy?.order === 'asc'
          ? 'desc' : 'asc'
      }
    }));
  }

  const onRowClick = (row: Product) => {
    alert(`Row clicked: ${JSON.stringify(row)}`);
    // TODO: Implement row click logic here
  };

  return (
    <div>
      <div className="row mb-3">
        <div className="col-sm-12 col-md-6">
          <div className="dt-buttons">
            <ButtonGroup>
              <Button variant="secondary" onClick={() => handleExport("Copy")}>
                Copy
              </Button>
              <Button variant="secondary" onClick={() => handleExport("CSV")}>
                CSV
              </Button>
              <Button variant="secondary" onClick={() => handleExport("Excel")}>
                Excel
              </Button>
              <Button variant="secondary" onClick={() => handleExport("PDF")}>
                PDF
              </Button>
              <Button variant="secondary" onClick={() => handleExport("Print")}>
                Print
              </Button>
            </ButtonGroup>
          </div>
        </div>
        
        <div className="col-sm-12 col-md-6 d-flex justify-content-end">
          <Form
            className="d-flex"
            onSubmit={e => {
              e.preventDefault();
              handleSearchConfirm(searchTerm);
            }}
          >
            <Form.Control
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
              }}
            />
            <Button
              variant="secondary"
              type="submit"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Form>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {fields.map(field => (
              <th
                key={field.toString()}
                className="fw-bold"
                style={{ cursor: "pointer" }}
                onClick={() => onHeaderClick(field.toString())}
              >
                {formatHeader(field)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.items.map((row, idx) => (
            <tr
              key={idx}
              style={{ cursor: "pointer" }}
              onClick={() => onRowClick(row)}
            >
              {fields.map(field => (
                <td key={field.toString()}>
                  {typeof row[field as keyof T] === "object" && row[field as keyof T] !== null
                    ? JSON.stringify(row[field as keyof T])
                    : String(row[field as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="row">
        <div className="col-sm-12 col-md-5">
          <div
            className="dataTables_info"
            role="status"
            aria-live="polite"
          >
            Showing {startIdx} to {endIdx} of {data.totalItemCount} entries
          </div>
        </div>
        <div className="col-sm-12 col-md-7">
          <div className="dataTables_paginate paging_simple_numbers">
            <ul className="pagination justify-content-end mb-0">
              <li
                className={`paginate_button page-item previous ${
                  queryParams.pageNumber === 1 ? "disabled" : ""
                }`}
                onClick={() => handlePageChange(queryParams.pageNumber - 1)}
              >
                <a href="#" className="page-link">
                  Previous
                </a>
              </li>

              {Array.from({ length: data.pageCount }, (_, i) => i + 1).map(page => (
                <li
                  key={page}
                  className={`paginate_button page-item ${
                    queryParams.pageNumber === page ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  <a href="#" className="page-link">
                    {page}
                  </a>
                </li>
              ))}

              <li
                className={`paginate_button page-item next ${
                  queryParams.pageNumber === data.pageCount ? "disabled" : ""
                }`}
                onClick={() => handlePageChange(queryParams.pageNumber + 1)}
              >
                <a href="#" className="page-link">
                  Next
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsTable;