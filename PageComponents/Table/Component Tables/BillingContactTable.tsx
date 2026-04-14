import { ManagerTenantBillingContactDetails, ManagerTenantBillingDetails } from '@/interfaces/api/models';
import { FC, useMemo, useState } from 'react';
import { ColumnMappingMetaData, ScTableProps } from '../table-model';
import { Button, Flex, Title } from '@mantine/core';
import ScTable from '../ScTable';
import SimpleTable, { SimpleColumnMapping, SimpleData } from '@/PageComponents/SimpleTable/SimpleTable';
import { IconPencil, IconPlus } from '@tabler/icons';
import ManageBillingContact from '@/PageComponents/Settings/Subscriptions/ManageBillingContact';
import helper from '@/utils/helper';
import SCCheckbox from '@/components/sc-controls/form-controls/sc-checkbox';

const BillingContactTable: FC<{
    billingDetails: ManagerTenantBillingDetails
    setBillingDetails: (newDetails: ManagerTenantBillingDetails) => void
    isThirdParty: boolean
}> = ({ billingDetails, setBillingDetails, isThirdParty }) => {

    const [editingItem, setEditingItem] = useState<ManagerTenantBillingContactDetails | null>(null);
    const [showDeactivated, setShowDeactivated] = useState(false);

    const simpleData = useMemo(() => {
        let contacts = billingDetails?.Contacts ?? [];

        return contacts.filter(x => showDeactivated || x.IsActive)
            .sort((a, b) => {
                if (a.IsPrimaryAccount) return -1;
                if (b.IsPrimaryAccount) return 1;
                return a.Name > b.Name ? 1 : -1;
            })
            .map((contact, idx) => {
                let data: SimpleData = {};
                Object.keys(contact).forEach(key => data[key] = contact[key]);
                return data;
            });
    }, [billingDetails, showDeactivated]);

    const mapping = useMemo(() => {
        let map: SimpleColumnMapping[] = [
            {
                key: 'Name',
                label: 'Name',
                linkAction: "handleEdit"
            },
            {
                key: 'EmailAddress',
                label: 'Email Address',
            },
            {
                key: 'MobileNumber',
                label: 'Mobile Number',
            },
            {
                key: 'OfficeNumber',
                label: 'Office Number',
            },
            {
                key: 'DesignationID',
                label: 'Designation',
                valueFunction: (item) => {
                    return billingDetails.Designations.find(x => x.ID === item["DesignationID"])?.Name ?? "";
                }
            },
            {
                key: 'IsPrimaryAccount',
                label: 'Primary Account',
                valueFunction: (item) => {
                    return (item as ManagerTenantBillingContactDetails).IsPrimaryAccount ? "✔" : "";
                }
            },
            {
                key: 'SendBill',
                label: 'Financial Comms',
                valueFunction: (item) => {
                    return (item as ManagerTenantBillingContactDetails).SendBill ? "✔" : "";
                },
                tooltip: "Receive invoices and statements"
            },
            {
                key: 'SendTechnical',
                label: 'Technical Comms',
                valueFunction: (item) => {
                    return (item as ManagerTenantBillingContactDetails).SendTechnical ? "✔" : "";
                },
                tooltip: "Receive general updates about the system"
            },
            {
                key: 'IsActive',
                label: 'Active',
                valueFunction: (item) => {
                    return (item as ManagerTenantBillingContactDetails).IsActive ? "✔" : "✖";
                }
            }
        ];
        return map;
    }, []);

    const handleEdit = (item) => {
        setEditingItem(item);
    };

    const onSave = (updatedBillingDetails: ManagerTenantBillingDetails) => {
        setBillingDetails(updatedBillingDetails);
        setEditingItem(null);
    };

    const onCancel = () => {
        setEditingItem(null);
    };

    const addContact = () => {
        setEditingItem({
            DesignationID: "",
            EmailAddress: "",
            ID: helper.newGuid(),
            IsActive: true,
            IsPrimaryAccount: false,
            MobileNumber: "",
            Name: "",
            OfficeNumber: "",
            SendBill: false,
            SendTechnical: false
        });
    };

    return (
        <>
            <Title order={5} mb={'md'} mt={25}>
                Contacts
            </Title>
            <div style={{ margin: "1rem 0" }}>
                This list contains all the contacts for your subscription. {isThirdParty && <span>As billing details are handled by a third party, financial comms may not go out to contacts configured to receive them.</span>}
            </div>

            <SCCheckbox
                    label='Show deactivated contacts'
                    value={showDeactivated as any}
                    onChange={(e) => setShowDeactivated(e)}
                />

            <div style={{ marginBottom: "1rem"}}>
                <SimpleTable
                    data={simpleData}
                    mapping={mapping}
                    minHeight={70}
                    controls={[
                        {
                            label: "Edit",
                            icon: <IconPencil color='var(--mantine-color-scBlue-7)' />,
                            name: "edit"
                        }
                    ]}
                    onAction={(name, item, idx) => {
                        handleEdit(item);
                    }}
                />
            </div>
            <Flex>
                <Button
                    style={{marginRight: "1rem"}}
                    onClick={addContact}
                    leftSection={<IconPlus height={16} />}
                >Add</Button> 
                
            </Flex>


            {!!editingItem && <ManageBillingContact
                item={editingItem}
                onSave={onSave}
                onCancel={onCancel}
                billingDetails={billingDetails}
            />}
        </>
    )
};

export default BillingContactTable;