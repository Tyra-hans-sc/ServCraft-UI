import {FC, useEffect, useState} from "react";
import {
    CloseButton,
    Combobox,
    Flex,
    InputBase,
    TextInputProps,
    Tooltip,
    useCombobox
} from "@mantine/core";
import {useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import {IconChevronDown, IconPlus} from "@tabler/icons-react";
import {useDebouncedValue, useDidUpdate} from "@mantine/hooks";
import ManageBundleModal from "@/PageComponents/Bundle/ManageBundleModal";
import BundleService from "@/services/inventory/bundle-service";
import { shadows } from "@/theme";
import {maxHeight} from "@mui/system";


const BundleSelector: FC<TextInputProps> = ({onChange, value, ...inputProps}) => {

    const [bundles, setBundles] = useState<{
        Name: string
        Description: string
        BundleTotalCalculated: number,
        BundleInventory: any[],
        ID: string
        IsActive: boolean,
        CreatedBy: string
        CreatedDate: string
        ModifiedBy: string
        ModifiedDate: string
        RowVersion: string
    }[]>([])
    const [bundlePayload, setBundlePayload] = useState({
        searchPhrase: '',
        sortExpression: '',
        sortDirection: '',
        pageIndex: 0,
        pageSize: 100,
        // startDate: "2024-05-21T05:24:14.861Z",
        // endDate: "2024-05-21T05:24:14.861Z",
        includeClosed: false,
        // exportAll: true
    })
    const [bundlePayloadDebounced] = useDebouncedValue(bundlePayload, 250)

    const canCreateBundleQuery = useQuery(['canCreateBundle'], BundleService.GetBundlesCanCreate)

    const bundleQuery = useQuery(['bundles', bundlePayloadDebounced],
        () => {
            return Fetch.post({
                url: '/Bundle/GetBundles',
                params: bundlePayloadDebounced
            } as any)
        }
    )

    useEffect(() => {
        if (bundleQuery.data?.Results) {
            setBundles(bundleQuery.data.Results)
        }
    }, [bundleQuery.data])


    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    useEffect(() => {
        setBundlePayload(x => ({...x, searchPhrase: search}))
    }, [search]);

    useEffect(() => {
        onChange && onChange(selectedId as any)
    }, [selectedId]);

    useDidUpdate(
        () => {
            if(!value) {
                setSearch('')
                setSelectedId('')
            }
        }, [value]
    )


    const options = bundles.map((item) => (
        <Combobox.Option value={item.ID} key={item.ID}>
            {item.Name}
        </Combobox.Option>
    ));

    const [showAddBundle, setShowAddBundle] = useState(false)

    return (
        <>
            <ManageBundleModal
                open={showAddBundle}
                setOpen={setShowAddBundle}
                onBundleSelected={
                    (bundle) => {
                        setBundles(p => [bundle, ...p])
                        setSelectedId(bundle.ID);
                        setSearch(bundle.Name || '');
                    }
                }
            />
            <Combobox
                store={combobox}
                withinPortal={true}
                onOptionSubmit={(val) => {
                    if (val === 'addNewBundle') {
                        setShowAddBundle(true)
                        combobox.closeDropdown();
                    } else {
                        setSelectedId(val);
                        setSearch(bundles.find(x => x.ID === val)?.Name || '');
                        combobox.closeDropdown();
                    }
                }}
                styles={{
                    dropdown: {maxHeight: 400, minHeight: 150, height: 'calc(100vh - 300px)', overflow: 'auto'},
                }}
            >
                <Combobox.Target>
                    <InputBase
                        rightSection={
                            selectedId ?
                                <CloseButton
                                    onClick={() => {
                                        setSelectedId('')
                                        setSearch('')
                                    }}
                                /> :
                                // <Combobox.Chevron />
                                <IconChevronDown style={{
                                    transform: `rotate(${combobox.dropdownOpened ? '-180deg' : '0'})`,
                                    transition: '100ms ease-in-out'
                                }} />
                        }
                        value={search}
                        onChange={(event) => {
                            combobox.openDropdown();
                            combobox.updateSelectedOptionIndex();
                            setSearch(event.currentTarget.value);
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => {
                            combobox.closeDropdown();
                            setSearch(bundles.find(x => x.ID === selectedId)?.Name || '')
                        }}
                        placeholder="Search Bundles"
                        {...inputProps}
                    />
                </Combobox.Target>

                <Combobox.Dropdown style={{boxShadow: shadows.combobox}} >
                    <Combobox.Options>
                        {
                            <Tooltip events={{ hover: true, focus: true, touch: true }} color={'goldenrod'} label={`Your package allows for a maximum of ${canCreateBundleQuery.data?.MaxCount} bundles`} disabled={canCreateBundleQuery.isFetching || canCreateBundleQuery?.data?.CanCreate}>
                                <Combobox.Option
                                    value={'addNewBundle'}
                                    disabled={!canCreateBundleQuery?.data?.CanCreate}
                                >
                                    <Flex align={'center'} gap={4}>
                                        <IconPlus size={14} /> Add Bundle
                                    </Flex>
                                </Combobox.Option>
                            </Tooltip>
                        }
                        {options?.length > 0 ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </>
    )
}

export default BundleSelector