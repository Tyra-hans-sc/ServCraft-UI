import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import SCMultiSelect from '../sc-controls/form-controls/sc-multiselect';
import SCInput from '../sc-controls/form-controls/sc-input';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import SCNativeSelect from '../sc-controls/form-controls/sc-native-select';
import SCModal from "@/PageComponents/Modal/SCModal";
import {Title, Text, Group, Stack, Flex, Loader, Button, Box} from "@mantine/core";
import SCPill from "@/components/sc-controls/form-controls/sc-pill";
import {IconArrowRight} from "@tabler/icons";
import { useMantineTheme } from '@mantine/core';
import {useMediaQuery} from "@mantine/hooks";

function InitialSetup({ onConfirm, setVisible, subscriptionInfo }) {

    const mobileView = useMediaQuery('(max-width: 800px)');


    const [pillItems, setPillItems] = useState([
        {
            label: 'Job Cards',
            selected: false
        },
        {
            label: 'Scheduling',
            selected: false
        },
        {
            label: 'Queries',
            selected: false
        },
        {
            label: 'Forms',
            selected: false
        },
        {
            label: 'Quotes',
            selected: false
        },
        {
            label: 'Invoices',
            selected: false
        },
        {
            label: 'Purchase Orders',
            selected: false
        },
        {
            label: 'Inventory',
            selected: false
        }
    ])

    const [inputs, setInputs] = useState({
        Industry: null,
        IndustryOther: '',
        BusinessType: [],
        RoleInBusiness: null,
        InterestedFeatures: [],
        ReferredSource: null,
        CountryID: null,
        Tax: 15,
        EmployeeCount: null, // above country
        UsingOtherSystem: null // under employee count
    });


    const [submitting, setSubmitting] = useState(false);

    const [useTax, setUseTax] = useState(true);
    const [otherIndustryTypeSelected, setOtherIndustryTypeSelected] = useState(false);
    const employeeCountOptions = ["1-2", "3-5", "6-10", "11-20", "21-50", "51+"];
    const roleOptions = [
        "Business owner",
        "Administrator",
        "Technician/Artisan/Tradesman",
        "Accounts",
        "Sales Rep",
        "Driver",
        "Contractor",
        "Other"
    ];
    const serviceTypeOptions = [
        "On-site field service",
        "Workshop based repairs",
        "Office-based",
        "Other"
    ];

    const [inputErrors, setInputErrors] = useState({});

    const closeModal = () => {
        setVisible(false);
    };

    const validate = () => {
        let validationItems = [{
            required: true, type: Enums.ControlType.Text, key: "RoleInBusiness", value: selectedRole
        }, {
            required: true, type: Enums.ControlType.Text, key: "Industry", value: selectedIndustry
        }, {
            required: true, type: Enums.ControlType.Text, key: "BusinessType", value: selectedBusinessType
        }, {
            required: true, type: Enums.ControlType.Text, key: "CountryID", value: selectedCountry
        },
        {
            required: true, type: Enums.ControlType.Text, key: "ReferredSource", value: inputs.ReferredSource
        },
        {
            required: useTax, type: Enums.ControlType.Number, key: "Tax", value: inputs.Tax
        }, {
            required: true, type: Enums.ControlType.Text, key: "EmployeeCount", value: selectedEmployeeCount
        }];

        if (otherIndustryTypeSelected) {
            validationItems = [...validationItems, {
                required: true, type: Enums.ControlType.Text, key: "IndustryOther", value: inputs.IndustryOther
            }];
        }

        const {isValid, errors} = Helper.validateInputs(validationItems);
        setInputErrors(errors);
        return isValid;
    };

    const doConfirm = async () => {

        if (validate()) {
            setSubmitting(true);
            if (onConfirm) {

                let result = {
                    ...inputs,
                    Industry: selectedIndustry,
                    EmployeeCount: selectedEmployeeCount,
                    RoleInBusiness: selectedRole,
                    CountryID: selectedCountry ? selectedCountry.ID : null,
                    CurrencyID: selectedCurrency ? selectedCurrency.ID : null,
                    Timezone: selectedTimezone ? selectedTimezone.Id : null,
                };

                let success = await onConfirm(result);
                if (success) {
                    closeModal();
                }
            } else {
                closeModal();
            }
            setSubmitting(false);
        }
    };

    const [industryList, setIndustryList] = useState([]);
    const [referredSourceList, setReferredSourceList] = useState([])

   const industryListQuery = useQuery({
        queryKey:['industryList'],
        queryFn:()=> Fetch.get({
            url:'/Company/IndustryList'
        })
    })

    const referredSourceListQuery = useQuery({
        queryKey:[],
        queryFn:()=> Fetch.get({
                url:'/Company/ReferredSourceList'
        })
    })

    useEffect(()=>{
        if(referredSourceListQuery.data && referredSourceListQuery.isSuccess){
                setReferredSourceList(referredSourceListQuery.data.Results.sort((a, b) => b === 'Other' ? -1 : a > b ? 1 : -1))
        }
    },[referredSourceListQuery.data, referredSourceListQuery.isSuccess])

    useEffect(()=>{
        if(industryListQuery.data && industryListQuery.data.Results){
            let list = industryListQuery.data.Results?.filter(x => x !== 'Other') ?? [];
            list.sort();
            list.push('Other');
            setIndustryList(list)
        } else {
            setIndustryList([
                'Other'
            ]);
        }
    },[industryListQuery.data, industryListQuery.isSuccess])

    const [selectedIndustry, setSelectedIndustry] = useState();
    const [selectedRole, setSelectedRole] = useState();
    const [selectedBusinessType, setSelectedBusinessType] = useState();
    const [selectedReferredSource, setSelectedReferredSource] = useState();

    const handleIndustryChange = (e) => {
        setSelectedIndustry(e);
        setInputs({...inputs, Industry: e});
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e);
        setInputs({...inputs, RoleInBusiness: e});
        setInputErrors({...inputErrors, RoleInBusiness: ""});
    };

    const handleBusinessTypeChange = (e) => {
        setSelectedBusinessType(e);
        setInputs({...inputs, BusinessType: e});
        setInputErrors({...inputErrors, BusinessType: ""});
    };

    useEffect(() => {
        setOtherIndustryTypeSelected(selectedIndustry && selectedIndustry.toLowerCase() === "other")
    }, [selectedIndustry]);

    const setIndustryOther = (e) => {
        setInputs({...inputs, IndustryOther: e.value});
    };

    const setInterestedFeatures = (val) => {
        setInputs({...inputs, InterestedFeatures: val.filter(x => x.selected).map(x => x.label)});
    }

    const [selectedEmployeeCount, setSelectedEmployeeCount] = useState();

    const handleEmployeeCountChange = (option) => {
        setSelectedEmployeeCount(option);
        setInputs({...inputs, EmployeeCount: option});
        setInputErrors({...inputErrors, EmployeeCount: ""});
    };

    const handleReferredSourceChange = (option) => {
        setSelectedReferredSource(option);
        setInputs({...inputs, ReferredSource: option});
        setInputErrors({...inputErrors, ReferredSource: ""});
    };
    const [selectedCountry, setSelectedCountry] = useState();

    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [selectedTimezone, setSelectedTimezone] = useState(null);

    const searchItems = async () => {
        const countriesRequest = await Fetch.get({
            url: '/Country',
        });
        setSelectedCountry(countriesRequest.Results.find(x => x.Description === "South Africa"));

        const currenciesRequest = await Fetch.get({
            url: '/Company/GetCurrencies',
        });
        setSelectedCurrency(currenciesRequest.Results.find(x => x.Code === "ZAR"));

        const timezonesRequest = await Fetch.get({
            url: '/Company/GetTimezones',
        });
        setSelectedTimezone(timezonesRequest.Results.find(x => x.Id === "South Africa Standard Time"));
    };

    useEffect(() => {
        searchItems();
    }, []);

    useEffect(() => {
    }, [subscriptionInfo]);

    const formGap = {base: 'xs', md: 'xl', lg: 'xl'}

    return (

        <SCModal open
                 modalProps={{trapFocus: false, fullScreen: mobileView}}
                 decor={'Industries&JobCount'}
                 headerSection={
                    <Box px={'lg'} pt={'lg'}>
                        <Title size={32}>
                            Great to have you on board!
                        </Title>

                        <Text c={'gray'} size={'sm'} maw={360}>
                            Help us curate your experience by sharing a bit more about your company.
                        </Text>
                    </Box>
                 }
        >

            <div >



                <Flex gap={formGap} mt={0} direction={{base: 'column', md: 'row'}}>
                    <div style={{flexGrow: 1}}>
                        <SCDropdownList
                            mt={0}
                            error={inputErrors.RoleInBusiness}
                            label="What is your role in the business?"
                            options={roleOptions}
                            required={true}
                            onChange={handleRoleChange}
                            name="Role"
                            value={selectedRole}
                        />
                    </div>
                    <div style={{flexGrow: 1}}>
                        <SCDropdownList
                            mt={0}
                            error={inputErrors.EmployeeCount}
                            label="How many employees do you have?"
                            options={employeeCountOptions}
                            placeholder=""
                            required={true}
                            onChange={handleEmployeeCountChange}
                            name="EmployeeCount"
                            value={selectedEmployeeCount}
                        />
                    </div>
                </Flex>

                <Flex gap={formGap} direction={{base: 'column', md: 'row'}} mt={formGap}>
                    <div style={{flexGrow: 1}}>
                        <SCDropdownList
                            mt={0}
                            error={inputErrors.Industry}
                            label="What industry do you work in?"
                            options={industryList}
                            required={true}
                            onChange={handleIndustryChange}
                            name="Industry"
                            value={selectedIndustry}
                        />
                    </div>

                    <Box maw={{base: '100%', lg: '50%'}} style={{flexGrow: 1}}>
                        <SCDropdownList
                            mt={0}
                            error={inputErrors.BusinessType}
                            label="What type of service do you provide?"
                            options={[
                                'Field Service',
                                'Workshops',
                                'Field Service and Workshops',
                                'Other'
                            ]}
                            required={true}
                            onChange={handleBusinessTypeChange}
                            name="BusinessType"
                            value={selectedBusinessType}
                        />
                    </Box>
                </Flex>

                {otherIndustryTypeSelected ?
                    <SCInput
                        mt={formGap}
                        value={inputs.IndustryOther}
                        onChange={setIndustryOther}
                        label="Please specify your industry"
                        required={true}
                        error={inputErrors.IndustryOther}
                    /> : ''
                }

                <SCDropdownList
                    mt={formGap}
                    error={inputErrors.ReferredSource}
                    label="How did you hear about ServCraft?"
                    options={referredSourceList}
                    required={true}
                    onChange={handleReferredSourceChange}
                    name="ReferredSource"
                    value={selectedReferredSource}
                />

                <Stack gap={1} mt={formGap}>
                    <Text size={'sm'} fw={500} c={'gray.9'} mb={3}>What features are you most interested in?</Text>
                    <Group>
                        <SCPill
                            onChange={(val) => {
                                setPillItems(val);
                                setInterestedFeatures(
                                    val
                                );
                            }
                            }
                            items={pillItems}
                        />
                    </Group>
                </Stack>
            </div>

            <Flex w={'100%'} justify={'end'} align={'end'} h={{base: 50, md: 100}}>
                <Button type={'submit'}
                        onClick={doConfirm}
                        color={'scBlue'}
                        rightSection={(submitting) && <Loader variant={'oval'} size={18} color={'white'} /> || <IconArrowRight size={16} />}
                        disabled={submitting}
                >
                    {submitting ? 'Submitting' : 'Get Started'}
                </Button>
            </Flex>

        </SCModal>
    )
}

export default InitialSetup;
