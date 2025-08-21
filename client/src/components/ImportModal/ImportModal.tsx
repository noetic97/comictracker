import React from "react";
import Modal from "../shared/Modal";
import ImportCSV from "../ImportCSV";
import { Comic } from "../../types";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (comics: Comic[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Comics" size="large">
      <ImportCSV onImport={onImport} />
    </Modal>
  );
};

export default ImportModal;
