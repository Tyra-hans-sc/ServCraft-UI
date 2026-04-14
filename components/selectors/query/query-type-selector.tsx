import SCDropdownList from "@/components/sc-controls/form-controls/sc-dropdownlist";
import * as Enums from "@/utils/enums";
import { useContext, useEffect, useRef, useState } from "react";
import PS from "@/services/permission/permission-service";
import ToastContext from "@/utils/toast-context";
import ManageLookup from '../../modals/lookup/manage-lookup';
import Fetch from "@/utils/Fetch";

export interface QueryTypeSelectorInputs {
    accessStatus?: number | undefined;
    selectedQueryType?: any;
    setSelectedQueryType?: (queryType: any) => void;
    error?: string | undefined;
    required?: boolean;
    ignoreAddOption?: boolean;
    placeholder?: string | undefined;
    canClear?: boolean;
    includeDisabled?: boolean;
}

export default function QueryTypeSelector(props: QueryTypeSelectorInputs) {

    const { accessStatus, selectedQueryType, setSelectedQueryType, error, required, ignoreAddOption = false, placeholder, canClear = false, includeDisabled = false } = props;

    const toast = useContext<any>(ToastContext);
    const [queryTypes, setQueryTypes] = useState<any[]>([]);
    const [showCreateLookup, setShowCreateLookup] = useState(false);
    const masterOfficeAdminPermission = useRef(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

    const addNewQueryType = () => {
        setShowCreateLookup(true);
    };

    const onLookupItemSave = (item) => {
        if (item) {
            setQueryTypes([...queryTypes, item]);
            setSelectedQueryType && setSelectedQueryType(item);
            toast.setToast({
                message: 'Query type saved successfully',
                show: true,
                type: Enums.ToastType.success
            });
        }

        setShowCreateLookup(false);
    };

    useEffect(() => {
        Fetch.get({
            url: `/QueryType`,
            apiUrlOverride: undefined,
            caller: "query-type-selector",
            ctx: undefined,
            customerID: undefined,
            params: { includeDisabled: includeDisabled },
            signal: undefined,
            tenantID: undefined,
            toastCtx: toast
        }).then(queryTypeResults => {
            setQueryTypes(queryTypeResults.Results.map(x => {
                return {...x, Description: `${x.Description}${!x.IsActive ? " [disabled]" : ""}`}
            }));
        });
    }, [])

    return (<>

        <SCDropdownList
            name="QueryType"
            addOption={(!ignoreAddOption
                && accessStatus !== Enums.AccessStatus.LockedWithAccess
                && accessStatus !== Enums.AccessStatus.LockedWithOutAccess
                && masterOfficeAdminPermission.current) ?
                { text: "Add new", action: (e) => addNewQueryType() } : undefined}
            value={selectedQueryType}
            onChange={setSelectedQueryType}
            options={queryTypes}
            error={error}
            label="Query Type"
            textField="Description"
            dataItemKey="ID"
            required={required}
            placeholder={placeholder}
            canClear={canClear}
            // hint={selectedQueryType?.ID && !queryTypes.some(x => x.ID === selectedQueryType.ID) ? "This query type is no longer available" : undefined}
            itemRenderMantine={
                (item) => {
                    return !queryTypes.some(x => x.ID === item.dataItem.ID) ? item.dataItem.Description + " [Disabled]" : item.dataItem.Description
                }
            }
        />

        {showCreateLookup ?
            <ManageLookup isNew={true} type={"queryType"} onLookupItemSave={onLookupItemSave} initialQueryType={selectedQueryType} accessStatus={accessStatus} /> : ''
        }
    </>);
}