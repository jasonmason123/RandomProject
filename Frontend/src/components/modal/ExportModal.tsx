import { ExportTemplate } from "@app/utils/common";
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface ExportModalProps {
  show: boolean;
  onClose: () => void;
  onExport: (template: ExportTemplate) => void;
}

export default function ExportModal({ show, onClose, onExport }: ExportModalProps) {
  const [template, setTemplate] = useState<ExportTemplate>("CSV");

  const handleExport = () => {
    onExport(template);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header
        closeButton
        placeholder={"Export Data"}
        onPointerEnterCapture={() => {}}
        onPointerLeaveCapture={() => {}}
      >
        <Modal.Title>Export Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label htmlFor="exportTemplate" className="form-label mr-1">
          Choose template:
        </label>
        <select
          id="exportTemplate"
          className="form-select"
          value={template}
          onChange={(e) => setTemplate(e.target.value as ExportTemplate)}
        >
          <option value="CSV">CSV</option>
          <option value="Excel">Excel</option>
          <option value="PDF">PDF</option>
        </select>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleExport}>
          Export
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
