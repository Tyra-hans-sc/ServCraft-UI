import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Flex } from '@mantine/core';
import { Link } from '@/interfaces/api/models';
import SCDropdownList from '@/components/sc-controls/form-controls/sc-dropdownlist';
import SCWidgetTitle from '@/components/sc-controls/widgets/new/sc-widget-title';
import * as Enums from '@/utils/enums';
import LinkItem from './LinkItem';
import linkService from '@/services/link/link-service';
import ToastContext from '@/utils/toast-context';

const ManageLink: FC<{
    linkToManage?: Link
    onSave: () => void
    parentItemID: string
    parentModule: number
}> = ({ linkToManage, onSave, parentItemID, parentModule }) => {

    const toast = useContext(ToastContext);

    const [link, setLink] = useState<Link | undefined>(!!linkToManage ? { ...linkToManage } : undefined);
    const [errors, setErrors] = useState<any>({});
    const [linkedItem, setLinkedItem] = useState<any>();
    const [linkedItemModule, setLinkedItemModule] = useState<number | undefined>();

    const getParentItem = () => {
        if (!link || (link.Item1ID !== parentItemID && link.Item2ID !== parentItemID)) return null;

        if (link.Item1ID === parentItemID) {
            return link.Item1;
        }
        else {
            return link.Item2;
        }
    };

    const linkTypeDescription = useMemo(() => {

        if (!link || (link.Item1ID !== parentItemID && link.Item2ID !== parentItemID)) return "";

        let item = getParentItem();

        switch (parentModule) {
            case Enums.Module.JobCard:
                return item.JobCardNumber;
            case Enums.Module.Query:
                return item.QueryCode;
            default:
                return "Unknown";
        }

    }, [link]);

    useEffect(() => {
        if (!!linkToManage) {
            setLink({ ...linkToManage });
            let linkedItemTemp: any;
            let linkedItemModuleTemp: number | undefined;
            if (linkToManage.Item1ID === parentItemID) {
                linkedItemTemp = linkToManage.Item2;
                linkedItemModuleTemp = linkToManage.Item2Module;
            }
            else {
                linkedItemTemp = linkToManage.Item1;
                linkedItemModuleTemp = linkToManage.Item1Module;
            }
            setLinkedItem(linkedItemTemp);
            setLinkedItemModule(linkedItemModuleTemp);
        }
        else {
            setLink(undefined);
            setLinkedItem(undefined);
            setLinkedItemModule(undefined);
        }
    }, [linkToManage]);

    const validate = () => {
        let isValid: boolean = true;
        let errorsTemp: any = {};

        if (!linkedItem) {
            isValid = false;
            errorsTemp.linkedItem = "Item must be linked";
        }

        setErrors(errorsTemp);
        return isValid;
    };

    const getLinkedItemDocNumber = () => {
        if (!linkedItem) return "";

        switch (link?.LinkType) {
            case Enums.LinkType.JobsToQueries:
                if (parentModule === Enums.Module.Query) return linkedItem.JobCardNumber;
                else return linkedItem.QueryCode;
            default:
                return "";
        }
    };

    const deleteLink = async () => {
        if (!link) return;

        let linkTemp = {...link};
        linkTemp.IsActive = false;
        await saveLink(linkTemp);
    };

    const saveLink = async (linkToSave: (Link | undefined) = link) => {
        if (!linkToSave) return;

        if (!validate()) return;

        let docNumber = getLinkedItemDocNumber();

        let linkTemp: Link = { ...linkToSave };
        if (parentItemID === linkTemp.Item1ID) {
            // update item2
            linkTemp.Item2ID = linkedItem.ID;
            linkTemp.Item2 = linkedItem;
            linkTemp.Item2DocNum = docNumber;
        }
        else {
            // update item1
            linkTemp.Item1ID = linkedItem.ID;
            linkTemp.Item1 = linkedItem;
            linkTemp.Item1DocNum = docNumber;
        }

        let updatedLink = await linkService.saveLink(linkTemp, toast);
        if (!!(updatedLink?.ID)) {
            onSave && onSave();
        }
    };

    const cancel = () => {
        onSave && onSave();
    }

    return (<>

        <SCWidgetTitle title={`${link?.ID ? "Edit" : "Create"} Link for ${linkTypeDescription}`} />

        {!!linkedItemModule &&
            <LinkItem
                module={linkedItemModule}
                lockdown={false} customerID={getParentItem()?.CustomerID}
                setSelected={setLinkedItem} selectedItem={linkedItem}
                // newParent={!(linkToManage?.ID)}
            />
        }

        {errors.linkedItem && <span className="error">{errors.linkedItem}</span>}

        <Flex justify={"space-between"} mt={"md"}>
            <div>
                {!!(linkToManage?.ID) &&
                    <Button variant='subtle' color={"red"} mr="sm" onClick={deleteLink}>
                        Delete
                    </Button>
                }
            </div>
            <Flex>
                <Button variant='subtle' mr="sm" onClick={cancel}>
                    Cancel
                </Button>
                <Button onClick={() => saveLink()}>
                    Save
                </Button>

            </Flex>
        </Flex>

        <style jsx>{`
            
            .error {
                color: red;
                font-size: 0.8rem;
            }

        `}</style>
    </>);
};

export default ManageLink;