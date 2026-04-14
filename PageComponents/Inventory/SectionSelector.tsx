import {FC, useEffect, useState} from "react";
import {CloseButton, Combobox, InputBase, TextInputProps, useCombobox} from "@mantine/core";
import {useQuery} from "@tanstack/react-query";
import {IconChevronDown} from "@tabler/icons-react";
import {getSectionsFromTableData} from "@/PageComponents/SectionTable/SectionTable";
import { shadows } from "@/theme";

const SectionSelector: FC<
    TextInputProps &
    {
        tableData: any[]
        dataSectionNameKey: string,
        dataSectionIdKey: string,
        itemId: string, moduleId: number, selectedTableGroup: any,
        onSectionsLoaded: (sections: any[]) => void,
        onSectionSelect: (section: any) => void
        onNewSectionNameChange: (title: string) => void
    }
> = (
    {
        tableData,
        dataSectionNameKey,
        dataSectionIdKey,
        itemId,
        moduleId,
        onChange,
        value,
        selectedTableGroup,
        onSectionsLoaded,
        onSectionSelect,
        onNewSectionNameChange,
        ...inputProps
    }
) => {

    const [sections, setSections] = useState<any[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [untitledSectionName, setUntitledSectionName] = useState('');

    const inventorySectionQuery = useQuery(['inventorySection', itemId, moduleId, tableData],
        () => {
            return getSectionsFromTableData(tableData, dataSectionNameKey, dataSectionIdKey, moduleId, itemId)

            /*Fetch.post({
                url: '/InventorySection/GetInventorySections',
                params: {
                    Module: Enums.Module.JobCard,
                    ItemID: itemId
                }
            } as any)*/
        }, {
            enabled: true
        }
    )

    useEffect(() => {
        const sections = inventorySectionQuery.data;
        if(sections?.hasOwnProperty('length')) {
            onSectionsLoaded(sections)
            setSections(sections)
            if(selectedTableGroup) {
                const section = sections.find(x => x.ID === selectedTableGroup.id)
                onSectionSelect(section)
                setSearch(section?.Name)
                setSelectedId(section?.ID)
                if(!section?.Name) {
                    setUntitledSectionName('Section ' + (sections.findIndex(x => x.ID === selectedTableGroup.id) + 1) + ' (Untitled)')
                }
            }
        }
    }, [inventorySectionQuery.data, selectedTableGroup, onSectionsLoaded, onSectionSelect])

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    useEffect(() => {
        onChange && onChange(selectedId as any)
    }, [selectedId]);


    const options = (sections.filter(x => x.Name?.includes(search)).length > 0 ? sections.filter(x => x.Name?.includes(search)) : sections).map((item, i) => (
        <Combobox.Option value={item.ID} key={item.ID}>
            {item.Name ? item.Name : 'Section ' + (i + 1) + ' (Untitled)'}
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            withinPortal={true}
            onOptionSubmit={(val) => {
                const section = sections.find(x => x.ID === val)
                setSelectedId(val);
                setSearch(section?.Name || '');
                setUntitledSectionName(!section?.Name ? 'Section ' + (sections.findIndex(x => x.ID === val) + 1) + ' (Untitled)' : '')
                onNewSectionNameChange(!section?.Name ? 'Section ' + (sections.findIndex(x => x.ID === val) + 1) + ' (Untitled)' : section?.Name)
                onSectionSelect(section || null);
                combobox.closeDropdown();
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
                                setUntitledSectionName('')
                                onNewSectionNameChange('')
                                onSectionSelect(null)
                            }}
                        /> :
                        // <Combobox.Chevron />
                        <IconChevronDown style={{
                            transform: `rotate(${combobox.dropdownOpened ? '-180deg' : '0'})`,
                            transition: '100ms ease-in-out'
                        }} />
                    }
                    value={search || untitledSectionName}
                    onChange={(event) => {
                        combobox.openDropdown();
                        combobox.updateSelectedOptionIndex();
                        setSearch(event.currentTarget.value);
                        onNewSectionNameChange(event.currentTarget.value)
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => {
                        combobox.closeDropdown();
                        setSearch(p => sections.find(x => x.ID === selectedId)?.Name || p)
                    }}
                    placeholder="Specify Section"
                    {...inputProps}
                />
            </Combobox.Target>

            {
                options.length > 0 &&
                <Combobox.Dropdown style={{boxShadow: shadows.combobox}}>
                    <Combobox.Options>
                        {options?.length > 0 ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
                    </Combobox.Options>
                </Combobox.Dropdown>

            }
        </Combobox>
    )
}

export default SectionSelector