import React, {FC, useState} from "react";
import SCModal from "@/PageComponents/Modal/SCModal";
import * as Enums from "@/utils/enums";
import {useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import EmployeeService from "@/services/employee/employee-service";
import DocumentService from "@/services/document/document-service";
import {Box, CloseButton, Flex, LoadingOverlay, ScrollArea, Text} from "@mantine/core"
import NewCommunicationForm, { NewCommunicationFormInitialValues, NewCommunicationFormProps } from "../Message/Communication/NewCommunicationForm";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";

interface SendToCustomerProps {
    id: string
    method: 'email' | 'sms' | 'both'
    module: number
    templateID?: string
    attachQuote?: boolean
    attachInvoice?: boolean
    attachPurchaseOrder?: boolean
    attachJobCard?: boolean
    preSelectEmployeeId?: string,
    initialValues?:NewCommunicationFormInitialValues
}


const getItem = (module: number, id: string) => {
    let itemUrl = ''
    switch (module) {
        case Enums.Module.Customer:
            itemUrl = '/Customer/';
            break;
        case Enums.Module.JobCard:
            itemUrl = '/Job/';
            break;
        case Enums.Module.Asset:
            itemUrl = '/Product?id=';
            break;
        case Enums.Module.Query:
            itemUrl = '/Query/';
            break;
        case Enums.Module.Quote:
            itemUrl = '/Quote/';
            break;
        case Enums.Module.Invoice:
            itemUrl = '/Invoice/';
            break;
        case Enums.Module.Project:
            itemUrl = '/Project/';
            break;
        case Enums.Module.Supplier:
            itemUrl = '/Supplier/';
            // isSupplier = true;
            break;
        case Enums.Module.PurchaseOrder:
            itemUrl = '/PurchaseOrder/';
            // isSupplier = true;
            // isPurchaseOrder = true;
            break;
        default:
            break;
    }
    return Fetch.get({
        url: itemUrl + id,
    })
}

const getOtherProps = async (item: any, isSupplier: boolean, isPurchaseOrder: boolean, moduleCode: number, templateID?: string) => {

    let customer: any = null;
    let supplier: any = null;

    if (isSupplier) {
        supplier = item;
        if (isPurchaseOrder) {
            supplier = await Fetch.get({
                url: `/Supplier/${item.SupplierID}`,
            } as any);
        }
    } else {
        customer = item;
        if (moduleCode)
            if (moduleCode != 0) {
                customer = await Fetch.get({
                    url: '/Customer/' + item.CustomerID,
                });
            }
    }

    const templates = await Fetch.post({
        url: '/Template/GetTemplates',
        params: {
            ModuleList: [Enums.getEnumStringValue(Enums.Module, moduleCode)],
            PageSize: 1000
        },
    });

    let template: any = null;
    if (templateID) {
        // get template to pass to component to preselect
        const templateResult = await Fetch.get({
            url: '/Template',
            params: { id: templateID },
        });
        template = templateResult;
    }

    const employees = await EmployeeService.getEmployees(item.StoreID);

    let documentDefinitionMetaData = null;
    const legacyDocuments = await DocumentService.getUseLegacyDocuments();
    if (!legacyDocuments) {
        const documentDefinition = await DocumentService.getDocumentDefinition();
        if (documentDefinition && documentDefinition.MetaData !== undefined) {
            documentDefinitionMetaData = JSON.parse(documentDefinition.MetaData);
        }
    }

    return {
        supplier,
        customer,
        moduleCode,
        templates: templates.Results,
        template,
        employees: employees.Results,
        documentDefinitionMetaData: documentDefinitionMetaData
    };
}

const SendToCustomerModal: FC<{
    onClose: () => void, onSent: () => void, show: boolean
} & SendToCustomerProps> = ({onClose, show, id: itemId, ...props}) => {

    const {data: useCommsV2, isLoading: loadingNewCommsAccess} = useQuery(['jobLabelPrinting'], () => featureService.getFeature(constants.features.COMMS_V2))

    const { module, templateID } = props;

    const {data: item, isFetching} = useQuery(['newCommunicationItem', itemId], () => getItem(module, itemId as string),
        {
            enabled: !!itemId && show,
        })

    const {data: otherProps, isSuccess: dataLoaded, isFetching: dataFetching} = useQuery(
        ['itemCommunicationData', item?.ID],
        () => getOtherProps(
            item,
            module === Enums.Module.PurchaseOrder || module === Enums.Module.Supplier,
            module === Enums.Module.PurchaseOrder,
            module,
            templateID
        ),
        {
            enabled: !!item?.ID && !isFetching
        }
    )

    const [validateAndCloseCounter, setValidateAndClose] = useState(0)

    const close = () => {
        ((!dataLoaded || dataFetching || isFetching) && onClose && onClose()) ||
        setValidateAndClose(p => p + 1)
    }

    return <>
        <SCModal
            size={1200}
            open={show}
            withCloseButton
            decor={'none'}
            // onClose={onClose}
            onClose={close}
            // p={0}
            modalProps={{
                px: 0,
                styles: {
                    body: {
                        paddingTop: 0,
                    }
                }
            }}
        >
            <div>

                <Flex
                    pos={'sticky'}
                    mb={8}
                    style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1010, padding: '16px 16px', paddingBottom: 0}}>
                    <Text size={'20px'} fw={'bolder'} c={'scBlue.9'}>
                        New Communication
                    </Text>
                    <CloseButton
                        ml={'auto'}
                        onClick={close}
                    />
                </Flex>
                {/*{
                    <Text size={'20px'} fw={'bolder'} c={'scBlue.9'} mb={'sm'}>
                        New Communication
                    </Text>
                }*/}
                <Box px={'sm'}>
                    {
                        dataLoaded && !dataFetching && !isFetching && !loadingNewCommsAccess && <>
                            <NewCommunicationForm
                                item={item}
                                itemId={itemId}
                                {...props}
                                {...otherProps}
                                initialValues={ props.initialValues}
                                onClose={onClose}   
                                validateAndCloseCounter={validateAndCloseCounter}
                                stickyHeaderOffset={40}
                            />
                        </>
                        ||
                        <Box mih={700}>
                            <LoadingOverlay visible/>
                        </Box>

                    }
                </Box>
            </div>


        </SCModal>
    </>;


}

export default SendToCustomerModal
