import { colors } from "../../../theme";
import { useEffect, useRef, useState } from "react";
import useMobileView from "../../../hooks/useMobileView";
import {Box, Card, ScrollArea} from "@mantine/core";

export default function ScContainerResponsive({ children }) {
    /*const ref = useRef();
    const colRef = useRef();
    const [height, setHeight] = useState("0px");
    const [mobileView] = useMobileView();

    useEffect(() => {
        updateDimensions();
        window.addEventListener("resize", updateDimensions);

        return () => {
            window.removeEventListener("resize", updateDimensions);
        };
    }, []);

    useEffect(() => {
        updateDimensions();
    }, [ref.current, colRef.current, mobileView]);

    const updateDimensions = () => {
        if (ref && ref.current) {
            const refRect = ref.current.getBoundingClientRect();
            setTimeout(() => {
                let y = parseInt(refRect.y.toString());
                setHeight(`calc(100vh - ${y}px)`);
            }, 500);

            if (colRef && colRef.current) {

                setTimeout(() => {

                    if (mobileView) {
                        colRef.current.style.left = "0px";
                    } else {
                        const colRefRect = colRef.current.getBoundingClientRect();
                        // console.log(colRefRect.width, refRect.width);
                        colRef.current.style.left = `${(refRect.width - colRefRect.width) / 2}px`;
                    }
                }, 0);
            }
        }
    };*/

    return (<>
        <Box
            bg={'gray.2'}
            mih={'calc(100dvh - 20px)'}
        >
            <Card
                style={{
                    paddingInlineEnd: 'var(--mantine-spacing-sm)',
                    minHeight: 'calc(100dvh - 20px)',
                    maxWidth: 1100,
                    marginInline: 'auto'
                    // width: '100%',
                }}
                bg={'transparent'}
            >
                <ScrollArea
                    // ref={colRef}
                >
                    {children}
                </ScrollArea>
            </Card>
        </Box>
    </>);
}