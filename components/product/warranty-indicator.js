import AS from '../../services/asset/asset-service';
import Time from '../../utils/time';
import {Badge, Text, ThemeIcon, Tooltip} from "@mantine/core";
import {IconSend} from "@tabler/icons";

const WarrantyIndicator = ({ purchaseDate, warrantyPeriod, refDate = null }) => {


    let dateRef = refDate ? refDate : Time.now();

    return (<>

        {/*{AS.inWarranty(purchaseDate, warrantyPeriod, dateRef) ? <div className="in-warranty" title={`Asset is in warranty until ${Time.toISOString(AS.expiryDate(purchaseDate, warrantyPeriod), false, false)}`}>
            IW
        </div> : ""}

        {AS.outOfWarranty(purchaseDate, warrantyPeriod, dateRef) ? <div className="out-warranty" title={`Asset is out of warranty since ${Time.toISOString(AS.expiryDate(purchaseDate, warrantyPeriod), false, false)}`}>
            OW
        </div> : ""}*/}

        {
            /*!purchaseDate &&
            <Tooltip color={'red.7'} label={`Asset is out of warranty - a purchase date has not been provided`}>
                <Badge color={'red'} px={3} size={'lg'} style={{pointerEvents: 'visible'}}>OW</Badge>
            </Tooltip> ||*/
            warrantyPeriod === 0 &&
            <Tooltip events={{ hover: true, focus: true, touch: true }} color={'red.7'} label={`Asset does not have a warranty period`}>
                {/*<Badge color={'red'} px={3} size={'lg'} style={{pointerEvents: 'visible'}}>OW</Badge>*/}
                <ThemeIcon color={'red'} size={'sm'} fw={600} radius={'lg'} style={{pointerEvents: 'visible'}}>
                    <Text size={10}>OW</Text>
                </ThemeIcon>
            </Tooltip> ||
            AS.inWarranty(purchaseDate, warrantyPeriod, dateRef) &&
            <Tooltip events={{ hover: true, focus: true, touch: true }} color={'green.8'} label={`Asset is in warranty until ${Time.toISOString(AS.expiryDate(purchaseDate, warrantyPeriod), false, false)}`}>
                {/*<Badge color={'green'} px={3} size={'lg'} style={{pointerEvents: 'visible'}}>IW</Badge>*/}
                <ThemeIcon color={'green'} size={'sm'} fw={600} radius={'lg'} style={{pointerEvents: 'visible'}}>
                    <Text size={10}>IW</Text>
                </ThemeIcon>
            </Tooltip> ||
            AS.outOfWarranty(purchaseDate, warrantyPeriod, dateRef) &&
            <Tooltip events={{ hover: true, focus: true, touch: true }} color={'red.7'} label={`Asset is out of warranty since ${Time.toISOString(AS.expiryDate(purchaseDate, warrantyPeriod), false, false)}`}>
                <ThemeIcon color={'red'} size={'sm'} fw={600} radius={'lg'} style={{pointerEvents: 'visible'}}>
                    <Text size={10}>OW</Text>
                </ThemeIcon>
            </Tooltip>
        }

        {

        }

        {

        }

        {/*<style jsx>{`
    .in-warranty {
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${colors.green};
        width: 38px;
        height: 38px;
        border: 1px solid ${colors.green};
      }

      .out-warranty {
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${colors.warningRed};
        width: 38px;
        height: 38px;
        border: 1px solid ${colors.warningRed};
      }
    `}</style>*/}
    </>);
};

export default WarrantyIndicator;
