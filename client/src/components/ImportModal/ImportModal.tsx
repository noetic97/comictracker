import React from "react";
import Modal from "../shared/Modal";
import ImportCSV from "../ImportCSV";
import { Comic } from "../../types";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (comics: Comic[]) => void;
  afterSuccessfulImport?: () => void | Promise<void>;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  afterSuccessfulImport,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Comics" size="large">
      <ImportCSV
        onImport={onImport}
        afterSuccessfulImport={afterSuccessfulImport}
      />
    </Modal>
  );
};

export default ImportModal;
