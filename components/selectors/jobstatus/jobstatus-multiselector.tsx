import SCMultiSelect from "@/components/sc-controls/form-controls/sc-multiselect";
import { useEffect, useMemo, useState } from "react";
import JobStatusService from '@/services/job/job-status-service';
import MiscService from '@/services/misc-service';

export default function JobStatusMultiSelector({ selectedJobStatuses, setSelectedJobStatuses, required, error, accessStatus, cypress, disabled = false, getAllStores = false, options = null, inOutAsID = false }) {

    const [statuses, setStatuses] = useState<any[]>([]);

    const getData = async () => {
        if (Array.isArray(options)) {
            setStatuses(options);
        } else {
            const data = await JobStatusService.getJobStatuses(false);
            setStatuses(data.Results.sort((a, b) => {
                if (b.IsActive && !a.IsActive) return 1;
                return a.WorkflowName > b.WorkflowName || (a.Description > b.Description && a.WorkflowName === b.WorkflowName) ? 1 : -1;
            }));
        }
    };

    useEffect(() => {
        getData();
    }, [options]);


    const handleChange = (value) => {
        let valueToReturn = value;
        if (inOutAsID) {
            valueToReturn = value?.map(x => x.ID) ?? [];
        }
        setSelectedJobStatuses && setSelectedJobStatuses(valueToReturn);
    };

    const selectedOptions = useMemo(() => {
        if (!Array.isArray(selectedJobStatuses)) return [];
        if (!inOutAsID) return selectedJobStatuses;
        return statuses.filter(x => selectedJobStatuses.includes(x.ID));
    }, [selectedJobStatuses, statuses]);

    return (
        <>
            <SCMultiSelect
                name="JobStatus"
                selectedOptions={selectedOptions}
                dataItemKey="ID"
                textField="Description"
                availableOptions={statuses}
                label="Job Status"
                required={required}
                disabled={disabled}
                error={error}
                onChange={handleChange}
                placeholder={"Select a job status"}
                groupField="WorkflowName"
                itemRenderMantine={(item) => {
                    let displayColor = item.dataItem.DisplayColor;
                    const { color, backgroundColor } = MiscService.getStatusColors(displayColor);

                    return (<div style={{ height: "100%", width: "100%", display: "flex", verticalAlign: "middle" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="11" stroke={color} stroke-width="1" fill={backgroundColor} />
                        </svg>
                        <span style={{ marginLeft: "0.5rem", fontStyle: (!item.dataItem.IsActive ? "italic" : undefined), opacity: (!item.dataItem.IsActive ? 0.4 : 1) }}>
                            <span style={{fontSize: "0.7rem"}}>({item.dataItem.WorkflowName})</span> <span style={{fontWeight: "bold"}}>{item.dataItem.Description}</span>{!item.dataItem.IsActive && " [disabled]"}
                        </span>
                    </div>);
                }}
                valueRenderMantine={(item) => {
                    let displayColor = item.dataItem.DisplayColor;
                    const { color, backgroundColor } = MiscService.getStatusColors(displayColor);
                    return (<div style={{color: color, backgroundColor: backgroundColor, padding: "0 4px"}}>
                        {item.dataItem.Description}{!item.dataItem.IsActive && " [disabled]"}
                    </div>);
                }}
            />
        </>
    );
};