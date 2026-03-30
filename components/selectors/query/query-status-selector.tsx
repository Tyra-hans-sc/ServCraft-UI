import SCDropdownList from "@/components/sc-controls/form-controls/sc-dropdownlist";
import * as Enums from "@/utils/enums";
import { useContext, useEffect, useRef, useState } from "react";
import PS from "@/services/permission/permission-service";
import ToastContext from "@/utils/toast-context";
import ManageLookup from '../../modals/lookup/manage-lookup';
import Fetch from "@/utils/Fetch";
import MiscService from '@/services/misc-service';
import { colors } from "@/theme";

export interface QueryStatusSelectorInputs {
    accessStatus?: number | undefined;
    selectedQueryStatus?: any;
    setSelectedQueryStatus?: (queryStatus: any) => void;
    error?: string | undefined;
    required?: boolean;
    ignoreAddOption?: boolean;
    placeholder?: string | undefined;
    canClear?: boolean;
    queryType?: any;
    includeDisabled?: boolean;
}

export default function QueryStatusSelector(props: QueryStatusSelectorInputs) {

    const { accessStatus, selectedQueryStatus, setSelectedQueryStatus, error, required, ignoreAddOption = false, placeholder, canClear = false, queryType, includeDisabled = false } = props;

    const toast = useContext<any>(ToastContext);
    const [queryStatuses, setQueryStatuses] = useState<any[]>([]);
    const [showCreateLookup, setShowCreateLookup] = useState(false);
    const masterOfficeAdminPermission = useRef(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));
    const [statusBackground, setStatusBackgound] = useState<string | null>("white");
    const [statusColor, setStatusColor] = useState<string | null>("");

    const addNewQueryStatus = () => {
        setShowCreateLookup(true);
    };

    const onLookupItemSave = (item) => {
        if (item) {
            setQueryStatuses([...queryStatuses, item]);
            setSelectedQueryStatus && setSelectedQueryStatus(item);;
            toast.setToast({
                message: 'Query status saved successfully',
                show: true,
                type: Enums.ToastType.success
            });
            getStatusColors(item);
        }

        setShowCreateLookup(false);
    };
    const getStatusColors = (status) => {
        if (status) {
            let displayColor = status.DisplayColor;

            const { color, backgroundColor } = MiscService.getStatusColors(displayColor);

            setStatusBackgound(backgroundColor);
            setStatusColor(color);
        } else {
            setStatusBackgound(null);
            setStatusColor(null);
        }
    };

    useEffect(() => {
        if (queryType) {

            const queryTypeID = typeof queryType === "string" ? queryType : queryType.ID;

            Fetch.get({
                url: `/QueryStatus`,
                apiUrlOverride: undefined,
                caller: "query-type-selector",
                ctx: undefined,
                customerID: undefined,
                params: { QueryTypeID: queryTypeID, includeDisabled: includeDisabled },
                signal: undefined,
                tenantID: undefined,
                toastCtx: toast
            }).then(queryStatusResults => {
                setQueryStatuses(queryStatusResults.Results.map(x => {
                    return { ...x, Description: `${x.Description}${!x.IsActive ? " [disabled]" : ""}` }
                }));
            });

            if (selectedQueryStatus && queryTypeID !== selectedQueryStatus.QueryTypeID) {
                setSelectedQueryStatus && setSelectedQueryStatus(null);
            }
        }
        else {
            setQueryStatuses([]);
            if (selectedQueryStatus) {
                setSelectedQueryStatus && setSelectedQueryStatus(null);
            }
        }


    }, [queryType])

    useEffect(() => {
        getStatusColors(selectedQueryStatus);
    }, [selectedQueryStatus]);

    return (<>
        <div className="query-status-selector">
            <SCDropdownList
                name="QueryType"
                addOption={(!ignoreAddOption && queryType
                    && accessStatus !== Enums.AccessStatus.LockedWithAccess
                    && accessStatus !== Enums.AccessStatus.LockedWithOutAccess
                    && masterOfficeAdminPermission.current) ?
                    { text: "Add new", action: (e) => addNewQueryStatus() } : undefined}
                value={selectedQueryStatus}
                onChange={setSelectedQueryStatus}
                options={queryStatuses}
                error={error}
                label="Query Status"
                textField="Description"
                dataItemKey="ID"
                required={required}
                placeholder={placeholder}
                canClear={canClear}
                itemRenderMantine={(itemProps) => {
                    return (<>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {queryStatuses && queryStatuses.some(x => x.DisplayColor) ?
                                <>
                                    {itemProps.dataItem.DisplayColor ?
                                        <div style={{ background: itemProps.dataItem.DisplayColor, opacity: 0.3, position: 'relative', padding: 0, minWidth: 16, minHeight: 16, borderRadius: '50%', marginRight: 8 }}>
                                            <div style={{ background: itemProps.dataItem.DisplayColor, position: 'absolute', padding: 0, width: 8, height: 8, left: 4, top: 4, borderRadius: '50%' }}>
                                            </div>
                                        </div>
                                        :
                                        <div style={{ background: `${colors.white}`, opacity: 0.3, position: 'relative', padding: 0, minWidth: 16, minHeight: 16, borderRadius: '50%', marginRight: 8 }}>
                                            <div style={{ background: `${colors.white}`, position: 'absolute', padding: 0, width: 8, height: 8, left: 4, top: 4, borderRadius: '50%' }}></div>
                                        </div>
                                    }</>
                                :
                                <></>
                            }
                            {itemProps.dataItem.Description}
                        </div>
                    </>);
                }}
            />
        </div>

        {showCreateLookup ?
            <ManageLookup isNew={true} type={"queryStatus"} onLookupItemSave={onLookupItemSave} initialQueryType={queryType} accessStatus={accessStatus} /> : ''
        }

        <style jsx>{`
            
     
        :global(.query-status-selector input) {
            background-color: ${statusBackground ? statusBackground : undefined};
            color: ${statusColor ? statusColor : colors.darkPrimary};
        }
            `}</style>
    </>);
}