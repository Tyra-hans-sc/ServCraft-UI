import { FC, useState } from 'react';
import moment from 'moment';
import {Box, Button, Flex, Group, Title, Alert, Tooltip } from '@mantine/core';
import SCModal from '@/PageComponents/Modal/SCModal';
import Time from '@/utils/time';
import ScDataFilter from '@/PageComponents/Table/Table Filter/ScDataFilter';
import { useMutation } from '@tanstack/react-query';
import DownloadService from '@/utils/download-service';
import { IconInfoCircle } from '@tabler/icons-react';

interface ExportSchedulesModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (data: {
    StartDateTime: string;
    EndDateTime: string;
    EmployeeIDList: string[];
    IncludeUnassigned: boolean;
  }) => void;
}

const ExportSchedulesModal: FC<ExportSchedulesModalProps> = ({ open, onClose, onConfirm }) => {

  // State for filter values
  const [filterState, setFilterState] = useState({
    StartDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
    EndDate: moment().add(1, 'month').endOf('month').format('YYYY-MM-DD') + 'T00:00:00',
    EmployeeIDList: [] as string[],
    JobStatusIDList: [] as string[],
    JobTypeIDList: [] as string[],
    IncludeUnassigned: false
  });

  const [exporting, setExporting] = useState(false);

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (params: {
      StartDateTime: string;
      EndDateTime: string;
      EmployeeIDList: string[];
      IncludeUnassigned: boolean;
    }) => {
      setExporting(true);
      await DownloadService.downloadFile(
        "POST",
        "/Appointment/GetExportedAppointments",
        params,
        false,
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        (() => {
          setExporting(false)
          onClose()
        }) as any
      );
    },
    onError: (error) => {
      console.error('Export failed:', error);
    }
  });

  // Check if date range is selected
  const isDateRangeSelected = !!filterState.StartDate && !!filterState.EndDate;

  // Handle export button click
  const handleExport = () => {
    // Ensure date range is selected before proceeding
    if (!isDateRangeSelected || exporting) {
      return;
    }

    const exportData = {
      StartDateTime: filterState.StartDate,
      EndDateTime: filterState.EndDate,
      EmployeeIDList: filterState.EmployeeIDList,
      JobStatusIDList: filterState.JobStatusIDList,
      JobTypeIDList: filterState.JobTypeIDList,
      IncludeUnassigned: filterState.IncludeUnassigned
    };

    // Use the mutation to export
    exportMutation.mutate(exportData);
    
    // Also call onConfirm if provided (for backward compatibility)
    if (onConfirm) {
      onConfirm(exportData);
    }
  };

  return (
    <SCModal
      open={open}
      onClose={onClose}
      withCloseButton
      footerSection={
        <Group>
          <Button variant="subtle" color={'gray.7'} onClick={onClose}>
            Cancel
          </Button>
          <Tooltip
              disabled={isDateRangeSelected}
              color={'scBlue.7'}
              label={"Please select a date range first"}
          >
            <Box>
              <Button
                  onClick={handleExport}
                  loading={exporting}
                  disabled={!isDateRangeSelected}
              >
                Export
              </Button>
            </Box>
          </Tooltip>
        </Group>
      }
    >
      <Title order={4} mb={'md'} c="scBlue.9">
        Export Appointments
      </Title>
      <Box>
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          color="blue"
          mb="md"
          variant="light"
          title={'Select filters to apply'}
        >
          Please select date range and filters to apply to the export. At minimum, a date range is required.
        </Alert>
        <ScDataFilter
            initialValues={filterState as any}
            onChange={(newState) => {
              setFilterState(newState as any);
            }}
            tableNoun={'Appointment'}
            flexProps={{ wrap: 'wrap', gap: 'md', w: '100%' }}
            singleSelectMode
            tableName={'export-appointments'}
            optionConfig={{
              options: [
                {
                  type: 'dateRange',
                  label: 'Start/End Date',
                  filterName: ['StartDate', 'EndDate'],
                },
                {
                  type: 'switch',
                  label: 'Include Unassigned',
                  filterName: 'IncludeUnassigned',
                  defaultValue: false
                },
                {
                  filterName: 'EmployeeIDList',
                  dataOptionValueKey: 'ID',
                  dataOptionLabelKey: ['FullName', 'EmailAddress', 'UserName'],
                  queryPath: '/Employee/GetEmployees',
                  label: 'Employee',
                  dataOptionColorKey: 'DisplayColor',
                },
                {
                  filterName: 'JobStatusIDList',
                  dataOptionValueKey: 'ID',
                  dataOptionLabelKey: ['Description'],
                  dataOptionColorKey: 'DisplayColor',
                  dataOptionGroupingKey: 'WorkflowName',
                  queryPath: '/JobStatus',
                  showIncludeDisabledToggle: true,
                  label: 'Job Status',
                  // defaultValue: ["8c2aca98-c499-45f2-8cd6-6d83eee1bb75", "bf92b39a-3d34-4b1e-b63e-fb95a5b686f1"],
                  queryParams: {
                    onlyActive: 'false'
                  },
                  type: 'multiselect'
                },
                {
                  filterName: 'JobTypeIDList',
                  dataOptionValueKey: 'ID',
                  dataOptionLabelKey: ['Name'],
                  dataOptionGroupingKey: 'WorkflowName',
                  queryPath: '/JobType',
                  label: 'Job Type'
                }
              ]
            }}
        />
      </Box>
    </SCModal>
  );
};

export default ExportSchedulesModal;