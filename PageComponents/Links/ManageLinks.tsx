import SCWidgetTitle from '@/components/sc-controls/widgets/new/sc-widget-title';
import { Link } from '@/interfaces/api/models';
import linkService from '@/services/link/link-service';
import { Box, Button } from '@mantine/core';
import { FC, useEffect, useMemo, useState } from 'react';
import ManageLink from './ManageLink';
import SCModal from '../Modal/SCModal';
import * as Enums from '@/utils/enums';
import { IconEdit } from '@tabler/icons';
import SCIcon from '@/components/sc-controls/misc/sc-icon';

const ManageLinks: FC<{
    item: any
    itemModule: number
    linkType: number
    title: string
    onChange?: (links: Link[]) => void
}> = ({ item, itemModule, linkType, title = "Linked Items", onChange }) => {

    const [links, setLinks] = useState<Link[]>([]);
    const [linkToManage, setLinkToManage] = useState<Link | undefined>();

    const getLinks = async () => {
        let linksTemp = await linkService.getLinksForItem(item.ID, linkType);
        setLinks(linksTemp);
        return linksTemp;
    };

    useEffect(() => {
        getLinks();
    }, []);

    const getItem2Module = () => {
        switch (linkType) {
            case Enums.LinkType.JobsToQueries:
                if (itemModule === Enums.Module.Query) return Enums.Module.JobCard;
                else if (itemModule === Enums.Module.JobCard) return Enums.Module.Query;
            default:
                return undefined;
        }
    };

    const getItem1DocNum = () => {
        switch (itemModule) {
            case Enums.Module.Query:
                return item.QueryCode;
            case Enums.Module.JobCard:
                return item.JobCardNumber;
            default:
                return undefined;
        }
    };

    const addLink = () => {
        setLinkToManage({
            IsActive: true,
            Item1ID: item.ID,
            Item1Module: itemModule,
            Item1DocNum: getItem1DocNum(),
            LinkType: linkType,
            Item1: item,
            Item2Module: getItem2Module()
        } as any);
    };

    const linkSaved = async () => {
        setLinkToManage(undefined);
        let linksTemp = await getLinks();
        onChange && onChange(linksTemp);
    };

    const getLinkDocNumber = (link: Link) => {

        if (link.Item1ID === item.ID) return link.Item2DocNum;
        else return link.Item1DocNum;
    }

    // console.log(linkToManage, links)

    return (<>

        <SCWidgetTitle marginTop={"md"} title={title} />

        <Box mb="sm">
            {links?.map((link, idx) => {
                return <div key={idx}>
                    <span>
                        <SCIcon name={"edit"} onClick={() => { setLinkToManage(link) }} />
                    </span>
                    <span>
                        {getLinkDocNumber(link)}
                    </span>
                </div>
            })}
        </Box>

        <Button w={"fit-content"}
            onClick={addLink}
        >Link to {Enums.getEnumStringValue(Enums.Module, getItem2Module(), true)}</Button>

        <SCModal open={!!linkToManage} onClose={() => setLinkToManage(undefined)}>
            <ManageLink linkToManage={linkToManage} onSave={linkSaved} parentItemID={item.ID} parentModule={itemModule} />
        </SCModal>


        <style jsx>{`

        `}</style>
    </>);
};

export default ManageLinks;