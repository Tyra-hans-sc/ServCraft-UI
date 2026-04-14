import { FC, useState } from "react";
import { Menu, Button, Text, Loader } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import ManageSignatures from '../../components/modals/jobcard/manage-signatures';
import PrintMenuModal from './PrintMenuModal';
import PrintTemplateModal from './PrintTemplateModal';
import PrintLabelModal from './PrintLabelModal';

interface PrintTemplate {
  text: string;
  link: string;
}

interface JobActionsProps {
  job: any;
  setJob: (job: any) => void;
  saveJob: () => Promise<boolean>;
  archiving: boolean;
  closing: boolean;
  archiveDisabled: boolean;
  closeDisabled: boolean;
  hasEmployee: boolean;
  accessStatus: any;
  editJobPermission: boolean;
  printTemplates?: PrintTemplate[];
  isPrinting?: boolean;
  showFormsButton?: boolean;
  addRecurringJobPermission?: boolean;
  onArchive: () => void;
  onClose: () => void;
  onOpen: () => void;
  onCreateQuote?: () => void;
  onCreateInvoice?: () => void;
  onCreatePurchaseOrder?: () => void;
  onCreateRecurringJob?: () => void;
  onPrintTemplate?: (link: string, mode: 'view' | 'download') => void;
  onPrintLabel?: (quantity: number) => void;
  moduleChangeCustomerPermission?: boolean; 
  onChangeCustomer?: () => void;
  onShowForms?: () => void;
}

const JobActions: FC<JobActionsProps> = ({
  job,
  setJob,
  saveJob,
  archiving,
  closing,
  archiveDisabled,
  closeDisabled,
  hasEmployee,
  accessStatus,
  editJobPermission,
  printTemplates = [],
  isPrinting = false,
  showFormsButton = false,
  addRecurringJobPermission = false,
  onArchive,
  onClose,
  onOpen,
  onCreateQuote,
  onCreateInvoice,
  onCreatePurchaseOrder,
  onCreateRecurringJob,
  onPrintTemplate,
  onPrintLabel,
  moduleChangeCustomerPermission = false,
  onChangeCustomer, 
  onShowForms,
}) => {
  const [showSignaturesModal, setShowSignaturesModal] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showPrintTemplate, setShowPrintTemplate] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState(false);

  const handlePrintClick = () => {
    setShowPrintMenu(true);
  };

  const handleSelectTemplate = () => {
    setShowPrintMenu(false);
    setShowPrintTemplate(true);
  };

  const handleSelectLabel = () => {
    setShowPrintMenu(false);
    setShowPrintLabel(true);
  };

  const handleBackToPrintMenu = () => {
    setShowPrintTemplate(false);
    setShowPrintLabel(false);
    setShowPrintMenu(true);
  };

  const handleClosePrintModals = () => {
    setShowPrintMenu(false);
    setShowPrintTemplate(false);
    setShowPrintLabel(false);
  };

  const handlePrintTemplate = async (link: string) => {
    if (onPrintTemplate) {
      await onPrintTemplate(link, 'download');
      handleClosePrintModals();
    }
  };

  const handlePreviewTemplate = (link: string) => {
    if (onPrintTemplate) {
      onPrintTemplate(link, 'view');
    }
  };

  const handlePrintLabels = async (quantity: number) => {
    if (onPrintLabel) {
      await onPrintLabel(quantity);
      handleClosePrintModals();
    }
  };

  return (
    <>
      <Menu shadow="md" width={220} position="bottom-end">
        <Menu.Target>
          <Button 
            variant="blue"
            rightSection={isPrinting ? <Loader size={16} color="white" /> : <IconChevronDown size={16} />}
          >
            Actions
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Documents</Menu.Label>
          <Menu.Item 
            onClick={handlePrintClick}
            disabled={isPrinting}
          >
            Print
          </Menu.Item>
          {showFormsButton && (
            <Menu.Item 
              onClick={onShowForms}
            >
              Forms
            </Menu.Item>
          )}

          {hasEmployee && (
            <Menu.Item 
              //leftSection={<IconSignature size={16} />}
              onClick={() => setShowSignaturesModal(true)}
              disabled={!editJobPermission}
            >
              Signatures
            </Menu.Item>
          )}

          <Menu.Divider />

          <Menu.Label>Create</Menu.Label>
          <Menu.Item 
            onClick={onCreateQuote}
          >
            Create Quote
          </Menu.Item>
          <Menu.Item 
            onClick={onCreateInvoice}
          >
            Create Invoice
          </Menu.Item>
          <Menu.Item 
            onClick={onCreatePurchaseOrder}
          >
            Create Purchase Order
          </Menu.Item>
          {addRecurringJobPermission && (
            <Menu.Item 
              onClick={onCreateRecurringJob}
            >
              Create Recurring Job
            </Menu.Item>
          )}

          <Menu.Divider />

          <Menu.Label>Job Management</Menu.Label>
          {hasEmployee && (
            <>
              {moduleChangeCustomerPermission && (
                  <Menu.Item
                    onClick={onChangeCustomer}
                  >
                    <Text size="sm">
                      Change Customer
                    </Text>
                  </Menu.Item>
                )}
              <Menu.Item
                onClick={onArchive}
                disabled={archiveDisabled || archiving}
              >
                <Text size="sm">
                  {job.IsArchived 
                    ? (archiving ? "Un-archiving..." : "Un-archive Job") 
                    : (archiving ? "Archiving..." : "Archive Job")
                  }
                </Text>
              </Menu.Item>
              <Menu.Item
                onClick={job.IsClosed ? onOpen : onClose}
                disabled={closeDisabled || closing}
              >
                <Text size="sm">
                  {job.IsClosed 
                    ? (closing ? "Opening..." : "Open Job") 
                    : (closing ? "Closing..." : "Close Job")
                  }
                </Text>
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>

      {showSignaturesModal && (
        <ManageSignatures 
          job={job} 
          setJob={setJob} 
          saveJob={saveJob}
          setShowModal={setShowSignaturesModal}
          accessStatus={accessStatus}
        />
      )}

      <PrintMenuModal
        opened={showPrintMenu}
        onClose={handleClosePrintModals}
        onSelectTemplate={handleSelectTemplate}
        onSelectLabel={handleSelectLabel}
        templates={printTemplates}
      />

      <PrintTemplateModal
        opened={showPrintTemplate}
        onClose={handleClosePrintModals}
        onBack={handleBackToPrintMenu}
        templates={printTemplates}
        onPrint={handlePrintTemplate}
        onPreview={handlePreviewTemplate}
        isPrinting={isPrinting}
      />

      <PrintLabelModal
        opened={showPrintLabel}
        onClose={handleClosePrintModals}
        onBack={handleBackToPrintMenu}
        onPrint={handlePrintLabels}
        isPrinting={isPrinting}
      />
    </>
  );
};

export default JobActions;