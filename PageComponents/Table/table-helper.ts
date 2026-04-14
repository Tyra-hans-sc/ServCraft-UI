import {
    ScFilterOption, ScFilterOptionMultiselectProps,
    ScTableFilterConfig,
    ScTableQueryStateProps
} from "@/PageComponents/Table/table-model";
import Time from "@/utils/time";

export const scColourMapping = {
    'Red': '#fa2e50'/*mantineTheme.colors.red[5]*/,
    'Orange': '#f06101'/*mantineTheme.colors.orange[5]*/,
    'Yellow': '#fdc840'/*mantineTheme.colors.yellow[5]*/,
    'Green': '#51ca68'/*mantineTheme.colors.green[5]*/,
    'Cyan': '#00d1ea'/*mantineTheme.colors.green[5]*/,
    'Blue': '#5a84e0'/*mantineTheme.colors.blue[5]*/,
    'Purple': '#725ae0'/*mantineTheme.colors.grape[5]*/,
    'Black': '#4f4f4f'/*mantineTheme.colors.dark[8]*/,
    'Grey': '#818181'/*mantineTheme.colors.gray[6]*/,
    'LightGrey': '#bcbcbc'/*mantineTheme.colors.gray[4]*/,
}

export const constructFilterInitialValue = (tableFilterConfig: ScTableFilterConfig, initialValues?: ScTableQueryStateProps) => {
    return tableFilterConfig.options.reduce((prev, option) => {
        if (option.type === 'dateRange' || option.type === 'priceRange') {
            return {
                ...prev,
                [option.filterName[0]]: initialValues && initialValues[option.filterName[0]] || option.defaultValue && option.defaultValue[0] || null,
                [option.filterName[1]]: initialValues && initialValues[option.filterName[1]] || option.defaultValue && option.defaultValue[1] || null
            }
        }

        if (option.type === 'hidden') {
            return {
                ...prev,
                [option.filterName]: option.defaultValue
            }
        } else {
            const val = (initialValues && initialValues[option.filterName]) ?? option.defaultValue/* || currentState*/

            const unassignedKeyName = option.hasOwnProperty('unassignedOption') ? (option as ScFilterOptionMultiselectProps).unassignedOption : undefined;
            const unassignedValue = !!unassignedKeyName && (initialValues?.[unassignedKeyName] ?? false)

            return {
                ...prev,
                [option.filterName]: (!option.type || option.type === 'multiselect' || option.type === 'tabs' ? val || [] : option.type === 'switch' ? val || false : ''),
                ...(unassignedKeyName ? {[unassignedKeyName]: unassignedValue} : {})
            };
        }
    }, {})
}

export function formatDate(value, hideTime?: boolean) {

    if (value) {
        const date = Time.parseDate(value);
        const monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ];

        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        let hour = date.getHours().toString();
        hour = hour.length < 2 ? "0" + hour : hour;
        let minutes = date.getMinutes().toString();
        minutes = minutes.length < 2 ? "0" + minutes : minutes;

        let str = day + ' ' + monthNames[monthIndex] + ' ' + year;
        if (hideTime !== true) {
            str += ' ' + hour + ':' + minutes;
        }
        return str;
    } else {
        return null;
    }
}

export function getActionId(actionName = '', itemId: string) {
    return actionName + itemId
}

export function getActiveFilterCount (filterOptions: ScFilterOption[], currentTableState: ScTableQueryStateProps) {
    return filterOptions.filter(
        x => {
            if (x.type === 'dateRange') {
                return !!currentTableState[x.filterName[0]]
            } else if (x.type === 'priceRange') {
                // Price range is active if either min or max value is set
                return !!currentTableState[x.filterName[0]] || !!currentTableState[x.filterName[1]]
            } else if (x.type === 'switch') {
                return currentTableState[x.filterName] !== (x.defaultValue || false)
            } else if(x.type === 'multiselect' || typeof x.type === 'undefined') {
                return (currentTableState[x.filterName] && currentTableState[x.filterName].length !== 0) || (x.hasOwnProperty('unassignedOption') && currentTableState[x.unassignedOption as string] === true)
            } else if(x.type === 'tabs' || x.type === 'hidden') {
                // return currentTableState[x.filterName] && currentTableState[x.filterName].length !== 0
                // not counting tabs as a filter
                return false
            } else {
                return currentTableState[x.filterName] && currentTableState[x.filterName]?.length !== 0
            }
        }
    ).length /* + filterOptions.filter(
        x => (x.type === 'multiselect' || typeof x.type === 'undefined') && x.hasOwnProperty('unassignedOption') && (currentTableState[x.unassignedOption as string] === true)
    ).length*/
}

export function flatMapLegacyAncillaryAndActiveFilter(metadata: string, currentTableState: ScTableQueryStateProps): any {
    try {
        const mappingNames = {
            Employees: 'EmployeeIDList',
            Stores: 'StoreIDList',
            JobTypes: 'JobTypeIDList',
            JobStatus: 'JobStatusIDList',
        }
        const parsed = JSON.parse(metadata)
        const combined = {...parsed.ActiveFilterIDs, ...parsed.AncillaryFilters}
        const standard = {
            SortExpression: parsed.SortExpression || '',
            // SortExpression: parsed.SortExpression || null,
            SortDirection: parsed.SortDirection || '',
            // SortDirection: parsed.SortDirection || null,
            pageSize: parsed.pageSize || 10,
            pageIndex: parsed.pageIndex || 0,
            // ...(parsed.searchPhrase && {searchPhrase: parsed.searchPhrase})
        }
        const mappedNames: any = Object.entries(mappingNames).filter(([, name]) => (currentTableState.hasOwnProperty(name))).reduce(
            (p, [name, filterName]) => ({
                ...p,
                [filterName]: combined[name]
            }), standard
        )
        if (parsed.DateRange) {
            mappedNames.StartDate = parsed.DateRange[0]
            mappedNames.EndDate = parsed.DateRange[1]
        }
        return mappedNames
    } catch (e) {
        console.error(e)
        return {}
    }

}

export function buildLegacyAncillaryAndActiveFilterMetaData(filterstate: ScTableQueryStateProps) {
    const activeIdMappingNames = {
        Employees: 'EmployeeIDList',
        Stores: 'StoreIDList',
        JobTypes: 'JobTypeIDList',
        JobStatus: 'JobStatusIDList',
    }
    const ancillaryMappingNames = {
        IncludeClosed: 'IncludeClosed',
        ShowArchived: 'ShowArchived'
    }

    const rootMappingNames = {
        SortExpression: 'SortExpression',
        SortDirection: 'SortDirection',
        // searchPhrase: 'searchPhrase'
    }

    const nullRoots = {
        pageIndex: 'pageIndex',
        pageSize: 'pageSize',
    }

    try {
        return {
            ActiveFilterIDs: Object.entries(activeIdMappingNames).reduce(
                (p, [name, filterName]) => (!filterstate.hasOwnProperty(filterName) ? {...p} : {
                    ...p,
                    [name]: filterstate[filterName] ?? []
                }), {}
            ),
            AncillaryFilters: Object.entries(ancillaryMappingNames).reduce(
                (p, [name, filterName]) => (!filterstate.hasOwnProperty(filterName) ? {...p} : {
                    ...p,
                    [name]: filterstate[filterName] ?? ''
                }), {}
            ),
            ...Object.entries(rootMappingNames).reduce(
                (p, [name, filterName]) => (!filterstate.hasOwnProperty(filterName) ? {...p} : {
                    ...p,
                    [name]: filterstate[filterName] ?? ''
                }), {}
            ),
            ...Object.entries(nullRoots).reduce(
                (p, [name, filterName]) => (!filterstate.hasOwnProperty(filterName) ? {...p} : {
                    ...p,
                    [name]: filterstate[filterName] ?? null
                }), {}
            ),
            ...(filterstate['StartDate'] ? {DateRange: [filterstate['StartDate'] || null, filterstate['EndDate'] || null]} : {})
        }
    } catch (e) {
        return {}
    }
}

export function sortFilterOptions(array: any[], key) {
    return array.sort(
        (a, b) => {
            return a.hasOwnProperty(key) && (typeof a[key] === 'boolean' ?
                (a[key] ? 0 : -1) : a[key] > b[key] ? 1 : -1) || -1
        }
    )
}
