import {FC, ReactNode, useState} from "react";
import {
    Avatar,
    Box,
    Checkbox, CloseButton,
    Combobox,
    darken,
    Flex,
    Pill,
    PillsInput, rem,
    ScrollArea,
    Text,
    Highlight,
    Tooltip,
    useCombobox
} from "@mantine/core";
import {
    IconCheck,
    IconMailCheck, IconMailExclamation,
    IconMailOff,
    IconMessage2Check, IconMessage2Exclamation,
    IconMessage2Off,
} from "@tabler/icons-react";
import {Contact, Employee} from "@/PageComponents/Message/Communication/NewCommunicationForm";
import * as Enums from "@/utils/enums";
import styles from './CommunicationContactSelector.module.css'
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import {IconSearch} from "@tabler/icons";

export const getCanSendToPersonError: (
    messageType: number,
    person: Employee | Contact
) => string | null = (messageType, person) => {

    const emailError = !person.EmailAddress ? 'No email address' :
        !person.SendEmail ? 'Excluded from emails' : null

    const smsError = !person.MobileNumber ? 'No mobile number' : !person.SendSMS ? 'Excluded from SMSes' : null
    const bothError = emailError && smsError ? (emailError + '. ' + smsError) : (emailError || smsError)

    return (
        messageType === Enums.MessageType.Email
    ) ? emailError : (
        messageType === Enums.MessageType.SMS
    ) ? smsError : bothError
}

const CommunicationContactSelector: FC<
    {
        contacts: Employee[] | Contact[];
        messageType: number;
        placeholder?: string;
        icon?: ReactNode;
        defaultValue: Employee[] | Contact[];
        onAdd: (contact: Employee | Contact) => void;
        onRemove: (index: number) => void;
    }
> = ({messageType, contacts, ...props}) => {


    const combobox = useCombobox();

    const [selectedContacts, setSelectedContacts] = useState<Contact[] | Employee[]>(props.defaultValue)

    const [value, setValue] = useState<string[]>(props.defaultValue.map(x => x.ID));
    const [search, setSearch] = useState('');

    const handleValueSelect = (val: string) => {
        setValue((current) => {
            const included = current.includes(val)
            const newVal = included ? current.filter((v) => v !== val) : [...current, val];
            setSelectedContacts(newVal.map(x => (contacts as any[]).find(y => y.ID === x)))

            if(!included) {
                const item = (contacts as Contact[]).find(x => x.ID === val)
                item && props.onAdd(item)
            } else {
                props.onRemove(props.defaultValue.findIndex(x => x.ID === val))
            }

            return newVal
            }
        )
    }

    const handleValueRemove = (val: string) => {
        props.onRemove(props.defaultValue.findIndex(x => x.ID === val))
        setValue((current) => {
            const newVal = current.filter((v) => v !== val)
            setSelectedContacts(newVal.map(x => (contacts as any[]).find(y => y.ID === x)))
            return newVal
        })
    }

    const options = (contacts as Contact[]).filter((x) => x.FullName && x.FullName.toLowerCase().includes(search.toLowerCase().trim()) ||
            x.EmailAddress && x.EmailAddress.toLowerCase().includes(search.toLowerCase().trim()) ||
            x.MobileNumber && x.MobileNumber.toLowerCase().includes(search.toLowerCase().trim())
        ).map(x => {
            const error = getCanSendToPersonError(messageType, x)
            return (
                <Combobox.Option
                    value={x.ID}
                    key={x.ID}
                    active={value.includes(x.ID)}
                    onMouseOver={() => combobox.resetSelectedOption()}
                    className={styles.option}
                >
                    <Flex
                        align={'center'}
                        gap={8}
                    >
                        <Checkbox
                            checked={value.includes(x.ID)}
                            onChange={() => {}}
                            aria-hidden
                            tabIndex={-1}
                            style={{ pointerEvents: 'none' }}
                            color={error ? 'gray.6' : 'scBlue'}
                            iconColor={error ? "yellow" : 'white'}
                            icon={({indeterminate, ...others}) =>
                                error ?
                                    messageType === Enums.MessageType.SMS ?
                                        <IconMessage2Exclamation
                                            {...others}
                                            stroke={4}
                                        /> :
                                        <IconMailExclamation
                                            {...others}
                                            stroke={4}
                                        /> :
                                    <IconCheck
                                        {...others}
                                        stroke={4}
                                    />
                            }
                            size="sm"
                        />
                        <Flex direction={'column'} w={'100%'}>
                            <Flex gap={5} align={'center'} c={error ? 'dimmed' : 'inherit'} w={'100%'}>
                                <Flex wrap={'wrap'} align={'center'}>
                                    <Highlight mr={5} size={'sm'} highlight={search} color={'scBlue.1'}>
                                        {x.FullName}
                                        {/*<span style={{color: 'var(--mantine-color-yellow-7)'}}>{error}</span>*/}
                                    </Highlight>
                                    {
                                        (x.MobileNumber || x.EmailAddress) && <>
                                            <Highlight size="xs" c="gray" highlight={search} color={'scBlue.1'}>
                                                {(x.EmailAddress || '') + (x.EmailAddress && x.MobileNumber ? ' - ' : '') + (x.MobileNumber || '')}
                                            </Highlight>
                                        </>
                                    }
                                </Flex>

                                <Tooltip
                                    disabled={!error}
                                    label={error}
                                    events={{hover: true, focus: true, touch: true}}
                                    openDelay={500}
                                    color={'yellow.6'}
                                >
                                    <Flex
                                        align={'center'} gap={5}
                                        ml={'auto'}
                                    >
                                        {(x.EmailAddress && x.SendEmail) ?
                                            <IconMailCheck color={'var(--mantine-color-scBlue-6)'} size={14} stroke={1.6}/> :
                                            <IconMailOff size={14} stroke={1.6}/>
                                        }
                                        {(x.MobileNumber && x.SendSMS) ?
                                            <IconMessage2Check color={'var(--mantine-color-scBlue-6)'} size={14} stroke={1.6}/> :
                                            <IconMessage2Off size={14} stroke={1.6}/>
                                        }
                                    </Flex>
                                </Tooltip>


                            </Flex>
                        </Flex>
                    </Flex>
                </Combobox.Option>
            )
        })


    return <>
        <Combobox
            store={combobox}
            onOptionSubmit={handleValueSelect}
        >
            <PillsInput
                maw={'100%'}
                onClick={() => combobox.openDropdown()}
                leftSection={props.icon ?? <IconSearch />}
            >
                <Pill.Group>
                    {
                        (selectedContacts as Employee[]).map((x) => {
                            const error = getCanSendToPersonError(messageType, x)

                            return (
                                    /*<Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
                                        {item}
                                    </Pill>*/
                                <Tooltip
                                    key={x.ID}
                                    disabled={!error}
                                    label={error}
                                    events={{hover: true, focus: true, touch: true}}
                                    openDelay={700}
                                    color={'yellow.6'}
                                >
                                    <Box
                                        style={{
                                            display: 'flex',
                                            cursor: 'default',
                                            alignItems: 'center',
                                            color: error ? 'var(--mantine-color-yellow-7)' : 'var(--mantine-color-gray-7)' /*darken(parsedColour, .3)*/,
                                            backgroundColor: 'var(--mantine-color-gray-1)',
                                            border: `${rem(1)} solid ${error ? 'var(--mantine-color-yellow-6)' : darken('var(--mantine-color-gray-1)', .2)}`,
                                            // paddingLeft: theme.spacing.sm,
                                            borderRadius: 'var(--mantine-radius-sm)',
                                            paddingLeft: 5,

                                        }}
                                    >
                                        <Flex align={'center'} justify={'start'} gap={5}>
                                            {
                                                error ?
                                                    <Avatar
                                                        size={16}
                                                        color={'gray'}
                                                    >
                                                        {
                                                            messageType === Enums.MessageType.SMS ?
                                                                <IconMessage2Exclamation
                                                                    stroke={4}
                                                                    color={'var(--mantine-color-yellow-6)'}
                                                                /> :
                                                                <IconMailExclamation
                                                                    stroke={4}
                                                                    color={'var(--mantine-color-yellow-6)'}
                                                                />
                                                        }
                                                    </Avatar>
                                                    :
                                                    <EmployeeAvatar color={x.DisplayColor} name={x.FullName} size={.8}/>
                                            }
                                            <Box style={{lineHeight: 1, fontSize: rem(12)}}>{x.FullName}</Box>
                                        </Flex>
                                        <CloseButton
                                            onMouseDown={() => handleValueRemove(x.ID)}
                                            variant={'transparent'}
                                            size={22}
                                            iconSize={14}
                                            tabIndex={-1}
                                            style={{color: 'inherit'}}
                                        />
                                    </Box>
                                </Tooltip>
                                )
                            }
                        )
                    }
                    <Combobox.EventsTarget>
                        <PillsInput.Field
                            onFocus={() => combobox.openDropdown()}
                            onBlur={() => combobox.closeDropdown()}
                            value={search}
                            placeholder={props.placeholder ?? 'Search'}
                            onChange={(event) => {
                                combobox.updateSelectedOptionIndex();
                                setSearch(event.currentTarget.value);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Backspace' && search.length === 0) {
                                    event.preventDefault();
                                    handleValueRemove(value[value.length - 1]);
                                }
                            }}
                        />
                    </Combobox.EventsTarget>
                </Pill.Group>
            </PillsInput>

            <div
                // className={classes.list}
            >
                <Combobox.Options
                    mt={5}
                >
                    <ScrollArea.Autosize
                        mah={155}
                        // mih={contacts.length > 4 ? 155 : 'auto'}
                        variant={'hover'}
                        offsetScrollbars
                    >
                        {options.length > 0 ? options : <Combobox.Empty>Nothing found....</Combobox.Empty>}
                    </ScrollArea.Autosize>
                </Combobox.Options>
            </div>
        </Combobox>
    </>
}

export default CommunicationContactSelector
