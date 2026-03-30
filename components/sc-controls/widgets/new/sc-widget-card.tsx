import { FC } from "react";
import {Card, CardProps, CloseButton, Stack} from "@mantine/core";

const SCWidgetCard:FC<{
    children?: any
    onDismiss?: () => void
    background?: string
    height?: number | string
    dismissHidden?: boolean
    cardProps?: CardProps | {}
}> = ({ 
    children, 
    onDismiss, 
    background = "white", 
    height = '100%', 
    dismissHidden = false,
    cardProps
}) => {

    return (<>
        <Card className={"sc-widget-card-container"}  mih={100} h={height} radius={8} mx={0} p={24} bg={background} {...cardProps}
              /*style={{
                  overflow: 'visible',
              }}*/
        >
            {children}
            {
                onDismiss &&
                <CloseButton style={{
                    position: 'absolute',
                    right: 4,
                    top: 4
                }}
                             styles={{
                                 root: {
                                     color: background !== 'white' ? 'white' : 'var(--mantine-color-gray-7)'
                                 }
                             }}
                 // c={background ? 'white' : 'gray.8'}
                    variant={'transparent'}
                    hidden={dismissHidden}
                    onClick={(e) => {
                        onDismiss()
                        e.stopPropagation();
                    }}
                />
            }
        </Card>

        <style jsx>{`

            :global(.sc-widget-card-container) {
                box-shadow: 0px 1px 3px 0px #0000001A;
            }
          

        `}</style>

    </>);
};

export default SCWidgetCard;