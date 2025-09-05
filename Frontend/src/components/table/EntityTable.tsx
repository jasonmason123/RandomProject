import { BaseEntity } from "@app/class/entities";
import { fetchItems } from "@app/services/api_caller/entity-api-caller";
import { PagedListResult } from "@app/types/dtos";
import { SortOrder } from "@app/types/enums";
import { BaseQueryParams } from "@app/types/query-params";
import { faArrowDown, faArrowUp, faCopy, faFileExport, faPlus, faPrint, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { ButtonGroup, Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import ExportModal from "../modal/ExportModal";
import { ExportTemplate } from "@app/utils/common";
import { useNavigate } from "react-router-dom";

type AutoTableProps<
  TEntity extends BaseEntity<string | number>,
  TQueryParam extends BaseQueryParams = BaseQueryParams
> = {
  pageSize: number;
  displayFields: (keyof TEntity)[];
  sortFields?: (keyof TEntity)[];
  apiName: string;
  isPaginationIncluded?: boolean;
  isSearchIncluded?: boolean;
  areControlButtonsIncluded?: boolean;
  initialQueryParams?: TQueryParam;
};

function EntityTable<
  TEntity extends BaseEntity<string | number>,
  TQueryParam extends BaseQueryParams = BaseQueryParams
>({
  pageSize,
  displayFields,
  sortFields,
  apiName,
  isPaginationIncluded = true,
  isSearchIncluded = true,
  areControlButtonsIncluded: isExportIncluded = true,
  initialQueryParams
}: AutoTableProps<TEntity, TQueryParam>) {

  function formatHeader(field: keyof TEntity): string {
    const str = String(field); // convert number | symbol to string
    return str
      .replace(/([A-Z])/g, " $1") // add space before capital letters
      .replace(/^./, s => s.toUpperCase()); // capitalize first letter
  }

  const navigate = useNavigate();
  const [data, setData] = useState<PagedListResult<TEntity>>({
    items: [],
    pageCount: 0,
    pageNumber: 1,
    pageSize: pageSize,
    totalItemCount: 0
  });
  const [queryParams, setQueryParams] = useState<TQueryParam>({
    pageNumber: data.pageNumber,
    pageSize: pageSize,
    searchTerm: "",
    ...initialQueryParams
  } as TQueryParam);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startIdx, setStartIdx] = useState(1);
  const [endIdx, setEndIdx] = useState(1);
  const tableRef = useRef<HTMLTableElement>(null);
  const lastSegment = window.location.pathname.split("/").filter(Boolean).pop();
  const fields = displayFields;

  useEffect(() => {
    fetchData();
  }, [queryParams]);

  const copyTableAsText = () => {
    if (!tableRef.current) return;

    let csv = "";
    for (const row of Array.from(tableRef.current.querySelectorAll("tr"))) {
      const cells = Array.from(row.querySelectorAll("th, td"));
      csv += cells.map((cell) => (cell as HTMLElement).innerText).join("\t") + "\n";
    }

    navigator.clipboard.writeText(csv).then(() => {
      alert(`Items ${startIdx} to ${endIdx} have been copied to your clipboard`);
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedList = await fetchItems<TEntity>(queryParams, apiName);

      // update state after fetching
      setData(fetchedList);
      setStartIdx((queryParams.pageNumber - 1) * queryParams.pageSize + 1);
      setEndIdx(Math.min(queryParams.pageNumber * queryParams.pageSize, fetchedList.totalItemCount));
      
    } catch (error) {
      alert("Error fetching data. See console for details.");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if(page < 1 || page > data.pageCount) return;

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

  const onAddClicked = () => {
    navigate(`/${lastSegment}/new`);
  };

  const onRowClick = (row: TEntity) => {
    navigate(`/${lastSegment}/${row.id}`);
  };

  const handleExport = (format: ExportTemplate) => {
    alert(`Exporting as ${format}...`);
  };

  const onCopyClicked = () => {
    copyTableAsText();
  };

  const onPrintClicked = () => {
    alert(`Printing item...`);
  };

  const onHeaderClick = (field: string) => {
    setQueryParams(prev => ({
      ...prev,
      sortProperty: field,
      sortOrder: prev.sortOrder === SortOrder.ASCENDING
        ? SortOrder.DESCENDING : SortOrder.ASCENDING
    }));
  }

  if (loading) return <div>Loading...</div>;
  if (data.items.length === 0) return <div>No data</div>;

  return (
    <div>
      <div className="row mb-3">
        {/* Export Buttons */}
        {isExportIncluded && (
          <div className="col-sm-12 col-md-6">
            <div className="dt-buttons">
              <ButtonGroup>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-add">Add a new item</Tooltip>}
                >
                  <Button variant="secondary" onClick={onAddClicked}>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-copy">Copy items</Tooltip>}
                >
                  <Button variant="secondary" onClick={onCopyClicked}>
                    <FontAwesomeIcon icon={faCopy} className="mr-2" />
                    Copy
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-export">Export data</Tooltip>}
                >
                  <Button variant="secondary" onClick={() => setShowExportModal(true)}>
                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                    Export
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-print">Print table</Tooltip>}
                >
                  <Button variant="secondary" onClick={onPrintClicked}>
                    <FontAwesomeIcon icon={faPrint} className="mr-2" />
                    Print
                  </Button>
                </OverlayTrigger>
              </ButtonGroup>
            </div>

            <ExportModal
              show={showExportModal}
              onClose={() => setShowExportModal(false)}
              onExport={handleExport}
            />
          </div>
        )}
        
        {/* Search Input */}
        {isSearchIncluded && (
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
        )}
      </div>

      <Table striped bordered hover responsive ref={tableRef}>
        <thead>
          <tr>
            {fields.map(field => {
              const isSortable = sortFields?.includes(field) ?? false;
              const isSorted = queryParams.sortProperty == field.toString();
              const sortOrder = isSorted ? queryParams.sortOrder : null;

              return (
                <th
                  key={field.toString()}
                  className="fw-bold"
                  style={{ cursor: isSortable ? "pointer" : "default" }}
                  onClick={isSortable ? () => onHeaderClick(field.toString()) : undefined}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    {/* Header text on the left */}
                    <span>{formatHeader(field)}</span>

                    {/* Sort icons on the right */}
                    {isSortable && (
                      <span style={{ display: "inline-flex", gap: 2 }}>
                        <FontAwesomeIcon
                          icon={faArrowUp}
                          style={{ color: sortOrder === SortOrder.ASCENDING ? "black" : "gray" }}
                          size="sm"
                        />
                        <FontAwesomeIcon
                          icon={faArrowDown}
                          style={{ color: sortOrder === SortOrder.DESCENDING ? "black" : "gray" }}
                          size="sm"
                        />
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
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
                  {typeof row[field as keyof TEntity] === "object" && row[field as keyof TEntity] !== null
                    ? JSON.stringify(row[field as keyof TEntity])
                    : String(row[field as keyof TEntity] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      {isPaginationIncluded && (
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
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(queryParams.pageNumber - 1);
                  }}
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
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(queryParams.pageNumber + 1);
                  }}
                >
                  <a href="#" className="page-link">
                    Next
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntityTable;