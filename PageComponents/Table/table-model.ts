import { ReactNode } from "react";
import { ResultResponse } from "@/interfaces/api/models";
import {ActionIconProps, FlexProps} from "@mantine/core";

export interface ColumnMappingData {
    Model?: string
    ColumnName: string
    Label: string
    // this property is used to overwrite the Label used in the column reordering drawer (ScActiveColumns)
    ColReorderLabel?: string
    Show?: boolean
    IsRequired?: boolean
    Disabled?: boolean
    // When true, the column should be hidden from the table and active columns UI
    IsHidden?: boolean
    CellType?: 'Description' | 'bold' | 'check' | 'currency' | 'date' | 'employee' | 'icon' | 'iconnull' | 'index' | 'initials' | 'jobstatus' | 'link' | 'none' | 'status' | 'statusList' | 'store' | 'warranty' | 'warrantyperiod' | 'stockItemType'
    // use with 'icon' CellType to flip X and ✔
    InverseLogic?: boolean
    Order?: number
    Sortable?: boolean
    MaxWidth?: null | number
    Width?: null | number
    //stringified JSON of ColumMappingMetaData format
    MetaData?: null | string
    UserWidth?: null | number | 'auto'
    ID: string
    IsActive?: boolean
    CreatedBy?: string
    CreatedDate?: string
    ModifiedBy?: string
    ModifiedDate?: string
    RowVersion?: string
    DisplayValueFunction?: ((item: any) => any) | undefined
}

export interface ColumnMappingMetaData {
    multipleItems?: {
        keyName: string
        itemLabelKey: string
        colorName?: string
    }
    displayColorKeyName?: string
    valueKey?: string
    display?: string
    mappingValues?: { [EnumKeyLabel: string]: number }
    colourMappingValues?: { [ColourTitle: string]: number }
    link?: {
        href: string
        slug: string
    }
    href?: string;
    slug?: string;
    triggerAction?: string;
    drawerAction?: string;
    docNumName?: string;
    totalColumn?: string;
}

export type ScTableFilterConfig = {
    // use to set if date range filter should be used
    options: ScFilterOption[]
    showIncludeDisabledOptionsToggle?: boolean
}
type ScFilterOptionSharedProps = {
    // label to be displayed otherwise key name will be parsed into Title Case
    label: string
    inclusion?: 'exclusive' | 'inclusive',
    fieldSettingSystemName?: string,
    hidden?: boolean // default false
}
export type ScFilterOptionHiddenProps = {
    // do not display this filter
    type: 'hidden'
    filterName: string
    defaultValue: any
} & ScFilterOptionSharedProps
export type ScFilterOptionTabsProps = {
    // api path to request count data
    statusCountsEndpoint?: string,
    type: 'tabs'
    filterName: string
    defaultValue?: string[]
    tabs: {
        [tabName: string]: {
            label: string,
            altLabel?: string,
            enumVal: number,
            value: string[],
            access: boolean
        }
    }
    inclusion?: 'exclusive' | 'inclusive'
} & ScFilterOptionSharedProps
export type ScFilterOptionDateRangeProps = {
    // unique filter key
    filterName: [string, string]
    // filter default value for specific type
    defaultValue?: [Date, Date] | [Date, null] | [null, null]
    // default is multiselect
    type: 'dateRange'
    // set optional placeholder
    placeholder?: string
    // inclusive is a filter that works in the opposite direction to a normal filter which reduces results - defaults to exclusive for dates
    inclusion?: 'exclusive' | 'inclusive'
} & ScFilterOptionSharedProps
export type ScFilterOptionPriceRangeProps = {
    // unique filter key
    filterName: [string, string]
    // filter default value for specific type
    defaultValue?: [Date, Date] | [Date, null] | [null, null]
    // default is multiselect
    type: 'priceRange'
    // set optional placeholder
    placeholder?: string
    // inclusive is a filter that works in the opposite direction to a normal filter which reduces results - defaults to exclusive for dates
    inclusion?: 'exclusive' | 'inclusive'
} & ScFilterOptionSharedProps
export type ScFilterOptionSwitchProps = {
    // unique filter key
    filterName: string
    // filter default value for specific type
    defaultValue?: boolean
    // default is multiselect
    type: 'switch'
    // data value is needed to clear switch conditionally when revealing hidden results
    dataValueKey?: string
    // inclusive is a filter that works in the opposite direction to a normal filter which reduces results - defaults to inclusive for switches
    inclusion?: 'exclusive' | 'inclusive'
} & ScFilterOptionSharedProps
export type ScFilterOptionMultiselectProps = {
    // unique filter key
    filterName: string
    // provided hardcoded options for filter
    hardcodedOptions?: {
        value: string
        enabled?: boolean
        label: string
        group?: string
        parentVal?: string
        useInitials?: boolean
        color?: string
    }[]
    // filter default value for specific type
    defaultValue?: string[]
    // data entry property name to filter on.  default = ID
    dataOptionValueKey?: string
    // data entry property name to filter on.  default = Name
    dataOptionLabelKey?: string[]
    // data entry property name to group options by
    dataOptionGroupingKey?: string
    // if provided will set style color to value of key name
    dataOptionColorKey?: string
    // set to filter by selected items of another filter
    dataOptionSiblingFilterName?: string
    // set the key name of data relating to the values of another filter
    dataOptionSiblingKey?: string
    /* dataOptionStyleVariant?: 'initials' | 'dot' | 'fill' */
    orderByKey?: string
    // default is multiselect
    type?: 'multiselect'
    // Inclusive is a filter that works in the opposite direction to a normal filter which reduces results - defaults to exclusive for multiselect
    inclusion?: 'exclusive' | 'inclusive'
    /*// shows search bar and sets searchPhrase request query param
    showSearch?: boolean*/
    // shows button to toggle disabled and sets includeDisabled = true in request query params
    showIncludeDisabledToggle?: boolean
    /*// shows include disabled button with inverse logic to set showAll = true in request query params - replaces include disabled
    showShowAllToggle?: boolean*/
    // manual options (provide either path or options to display options todo
    options?: filterSelectOption
    // use to override React Query keys used for request optimization
    queryUniqueKeys?: string[]
    // api path to obtain data from server
    queryPath?: string
    // add default query params to the request if needed
    queryParams?: {
        [paramName: string]: string | undefined
    }
    // custom query function - if not using url or params
    queryFunction?: (props: { search?: string; showAll?: boolean;[more: string]: any }) => Promise<any>
    // set optional placeholder
    placeholder?: string
    // makes option hidden during initial load to avoid filter control popping in and out on mount when there 1 or less options
    hiddenWhileLoading?: boolean
    // set showForSingleItem to keep the filter shown when there is only one option available - useful when there is only one status that does not apply to all items
    showForSingleItem?: boolean
    // use it to show an unassigned special case option - sets boolean filter with name specified
    unassignedOption?: string
    unassignedOptionMeta?: {
        label: string
        icon: ReactNode
    }
} & ScFilterOptionSharedProps
export type ScFilterOption = (ScFilterOptionPriceRangeProps | ScFilterOptionDateRangeProps | ScFilterOptionSwitchProps | ScFilterOptionMultiselectProps | ScFilterOptionHiddenProps | ScFilterOptionTabsProps)
export type filterSelectOption = ({
    label: string
    value: string
} & { [key: string]: any })[]
export type ScTableFilterChangeEvent = (newFilterValue: { [filterName: string]: (string | null)[] | boolean }, cleanup?: boolean) => void

export interface ScTableFilterComponentProps extends ScTableComponentSharedProps {
    initialValues?: ScTableQueryStateProps,
    onChange: ScTableFilterChangeEvent
    optionConfig: ScTableFilterConfig,
    showDisabledFilterOptions?: boolean
    additionalHintSection?: ReactNode,
    flexProps?: FlexProps
    singleSelectMode?: boolean
    rememberState?: boolean
}

export type ScTableQueryStateProps = { searchPhrase: string } & PageProps & SortProps & (FilterProps | {})

export interface FilterProps { [filterName: string]: string[] | string | number | boolean }

export interface ScTablePaginationProps {
    totalElements?: number
    totalOnPage?: number
    currentPage: number
    pageSize: number
    onChange: (newPageState: PageProps) => void
    rowsRelabel?: string // default = 'Rows' eg. Rows per page
    hidePageSizeDropdown?: boolean
}
export interface PageProps {
    pageSize: number
    pageIndex: number
}

interface CarMapping {
    key: string,
    href?: string,
    slug?: string,
}

interface CardMappingConfig {
    link?: CarMapping
    location?: CarMapping
    status?: CarMapping
    employee?: CarMapping
    date?: CarMapping
    active?: CarMapping
}

export type ScTableSortChangeEvent = (newSortValue: SortProps) => void
export interface ScTableDataComponentProps extends ScTableComponentSharedProps {
    onSort: ScTableSortChangeEvent
    onUpdateColMapping: (newColumnMappings: ColumnMappingData[]) => void
    columnMapping?: ColumnMappingData[]
    cardMapping?: CardMappingConfig
    tableData?: any[]
    tableState?: ScTableQueryStateProps
    tableIconPath?: string
    filterConfig?: ScTableFilterConfig
    filterLength?: number
    // optionally force table height
    height?: number | string
    mih?: number
    onAction?: (actionName: string, item: any) => void
    actions?: TableAction[]
    actionStates?: TableActionStates
    selectMode?: 'bulk' | 'single' | 'none'
    onSelected?: (items: any[]) => void
    // filteredOutResultsMeta? : FilteredOutResults
    noResultsSection?: ReactNode | null
    openColumnSettings?: ScOpenColumnSettings
    recentlyAdded?: any[]
    // default true
    showControlsOnHover?: boolean
    thumbnailPropertyName?: string
    imagePropertyName?: string
    activeItemId?: string
}
export interface SortProps {
    SortDirection: 'ascending' | 'descending' | '';
    SortExpression: string;
}

export type FilteredOutResults = { data: any; diff: number; params: any; } | null

export interface ColHeadingProps { name: string, sortable: boolean, label: string, width: any }

export interface ScTableProps extends ScTableComponentSharedProps {
    selectMode?: 'bulk' | 'single' | 'none'
    onSelected?: (items: any[]) => void
    // use UserConfigService.getFilterConfig() or provide object directly
    authUserConfig?: any
    // obtains and updates column mapping from server based on provided 'model' name
    columnMappingModelName?: string
    // alternatively provide hardcoded column mapping to display data without module column mapping api
    staticColumnMapping?: ColumnMappingData[]
    // hardcoded colum mapping keys - specify keys to be merged with data obtained after fetching
    columMappingOverrideValues?: {
        [columnName: string]: ColumnMappingData | {}
    }
    // tableDataQueryFunction is used as an alternative to providing an endpoint
    tableDataQueryFunction?: any
    tableDataEndpoint?: string
    tableFilterMetaData?: ScTableFilterConfig
    tableIconPath?: string
    actions?: TableAction[]
    onAction?: (actionName: string, item: any) => void
    // default true
    showControlsOnHover?: boolean
    actionStates?: TableActionStates
    onTableQueryStateChanged?: (newFilterState: ScTableQueryStateProps) => void
    // keeps bottom right pagination space to cater for hubspot
    bottomRightSpace?: boolean
    // using map view will yield the option to view data within a map - data will be rendered based on card view config
    useMapView?: boolean
    // queryParamNames are used to set filters from url query string parameters - key is the query param name & filtername is the option name specified in filters
    queryParamNames?: {
        [paramName: string]: {
            // option sets the filter for multiselect controls - unassigned will set the value of the relevant unassigned option of a multiselect where applicable
            type: 'option' | 'unassignedOption' | 'boolean',
            filterName: string
        }
    },
    forceDataRefreshFlipFlop?: boolean
    removeFilter?: boolean
    removePagination?: boolean
    tableDataOnLoad?: (data: ResultResponse<any>) => void
    //(for unique data) by default table stores state globally, bypass if every occurrence of the table will hold unique data
    bypassGlobalState?: boolean
    // overwrite table query payload with single value
    tableDataPayloadSingleQueryItemValue?: string
    openColumnSettings?: ScOpenColumnSettings
    // extracted items will be kept at the top of the list and lighted up
    recentlyAdded?: any[]
    thumbnailPropertyName?: string
    imagePropertyName?: string
    cardMapping?: CardMappingConfig
    // Trigger value that when changed, will show all items (set inclusive filters to true)
    showAllItemsTrigger?: number
    activeItemId?: string
}

export interface TableAction {
    // defaults to 'default'
    type?: 'default' | 'warning' | 'error'
    icon: ReactNode
    name: string
    label: string
    disabledLabel?: string
    // label will be used when action is loading as defined by TableActionStates
    activeLabel?: string
    // set true to put item in 'more' dropdown
    moreMenu?: boolean
    // default actions are executed when 'check' column types are clicked
    default?: boolean,
    // conditionally show if data.key === value
    conditionalShow?: {
        equals: any
        key: string
    }
    showFunction?: (item: any) => boolean
    conditionalDisable?: (item: any) => boolean
    // simpletable: set false to remove gray style on action button
    lightMode?: boolean
    buttonProps?: ActionIconProps
}

export interface TableActionStates { [actionnameItemid: string]: 'loading' | 'error' | 'success' | 'none' }

interface ScTableComponentSharedProps {
    tableName: string,
    tableNoun?: string
    tableAltMultipleNoun?: string
    // custom message to display when there are items in the system but none are visible due to filters (e.g., "No open jobs" when all jobs are closed)
    noVisibleItemsMessage?: string
    // custom secondary message when items exist but are hidden (e.g., "View all jobs to see your existing ones.")
    noVisibleItemsSecondaryMessage?: string
    // action button/element to show when items exist but are hidden (e.g., "View all jobs" button)
    noVisibleItemsAction?: ReactNode
    // custom secondary message when no items exist at all (optional)
    noItemsSecondaryMessage?: string
    // action button/element to show when no items exist at all (e.g., "Create your first job" button)
    noItemsAction?: ReactNode
    // the module enum - optional - only used to hide filters based on field settings
    module?: number
}

interface ScOpenColumnSettings {
    text: string,
    triggerAction: string
}

export interface LegacyTableProps {
    columns: ColumnMappingData[],
    filters: { [optionsKey: string]: any[] }
    ancillaryFilters: {
        IncludeClosed: [
            {
                type: 8,
                label: string
            }
        ]
        ShowArchived: [
            {
                type: 8,
                label: string
            }
        ]
    }
    initialStatusFilterIds: []
    jobs: any[]
    totalResults: number
    filtersConfig: {
        AuthUserID: string
        AuthUserUserName: null
        ConfigurationType: number
        ConfigurationSection: number
        // stringified json holding active filters
        MetaData: string
        ID: string
        IsActive: boolean
        CreatedBy: string
        CreatedDate: string
        ModifiedBy: string
        ModifiedDate: string
        RowVersion: null
    }
    activeFilterIdsDefault: {
        JobTypes?: any[]
        JobStatus?: any[]
        Employees?: any[]
        Stores?: any[]
        DateRange?: [
            null | Date,
            null | Date
        ],
        Services?: any[]
    },
    ancillaryFiltersDefault: {
        IncludeClosed: boolean
        ShowArchived: boolean
    },
    sortExpressionDefault: string
    sortDirectionDefault: string
    initTab: string
    token: string
    tenantID: string
}
