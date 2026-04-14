import {FC, PropsWithChildren, ReactNode, useState} from "react";
import {ActionIcon, CloseButton, Drawer, DrawerProps, Flex, Tooltip} from "@mantine/core";
import {useViewportSize, useWindowEvent} from "@mantine/hooks";
import {IconArrowsDiagonal, IconArrowsDiagonal2, IconArrowsDiagonalMinimize2, IconEdit} from "@tabler/icons-react";
import Link from "next/link";
import {useAtom} from "jotai/index";
import {openModalsAtom} from "@/utils/atoms";

const defaultWidth = 530

// helper to find if modal was clicked
const isAcceptedElementOrParent = (element: HTMLElement | null): boolean => {
    while (element) {
        if (element.classList.contains('mantine-Modal-root')) return true;
        if (element.classList.contains('mantine-Combobox-dropdown')) return true; // dropdowns are usually in portals so this prevents accidental closing
        if (element.classList.contains('mantine-Menu-dropdown')) return true; // dropdowns are usually in portals so this prevents accidental closing
        if (element.nodeName === 'A') return true;
        element = element.parentElement;
    }
    return false;
};

const ScDrawer: FC<PropsWithChildren<DrawerProps &
    {
        title?: string | ReactNode;
        // default = false
        linkToFullPage?: false | string;
        showFullscreenExpandButton?: boolean;
        onFullScreenModeChanges?: (fullscreen: boolean) => void;
    }>> = (
    {
        children,
        showFullscreenExpandButton,
        onFullScreenModeChanges,
        linkToFullPage,
        ...drawerProps
    }
) => {

    // attempt to close when click away, but can become problematic when not allowed to close


    const {width: screenWidth} = useViewportSize()

    const [fullscreen, setFullscreen] = useState(false);

    const width = fullscreen ? 2000 : drawerProps.size ?? defaultWidth

    /**
     * closeOnOutsideClick prop does not work when overlay is removed.
     * using element ref for outside click detection does not work as portals are often used withing wrapped components.
     *
     * this solution tries to determine outside click based on drawer width,
     * it will not close when clicking on anchors or links (to enable functionality to keep drawer open when link is clicked that updates drawer content),
     * it will not close when clicking modals
     **/
    useWindowEvent('mousedown', (e) => {
        if (document && typeof document !== 'undefined') {
            const totalx = document.body.scrollWidth
            const offsetX = e.clientX /*(offsetX will be 0 when clicked using Space or Enter keypress)*/

            if(!!offsetX && !!totalx) { // ensure offsetX exists - this will avoid accidental closes resulting from keyboard interactions
                const clickedElement = e.target as HTMLElement
                const keepOpen = isAcceptedElementOrParent(clickedElement)

                if (!keepOpen && !!offsetX  && (totalx - offsetX) > +width) {
                    drawerProps.closeOnClickOutside !== false && drawerProps.opened &&
                    drawerProps.onClose()
                }
            }
        }
    }, {
        once: false,
        capture: true,
    });

    const [openModals] = useAtom(openModalsAtom)

    return (
        <Drawer
            overlayProps={{
                color: 'var(--mantine-color-scBlue-5)',
                blur: 10,
                opacity: .25
            }}
            position={'right'}
            {...drawerProps}
            size={width}
            styles={{
                ...drawerProps.styles,
                title: {
                    fontSize: 24,
                    fontWeight: 600,
                    color: 'var(--mantine-color-scBlue-9)',
                    width: '100%',
                    ...drawerProps.styles?.title,
                },
                content: {
                    borderLeft: '1px solid var(--mantine-color-gray-4)',
                    boxShadow: '-1px 0 3px 2px var(--mantine-color-gray-4)',
                    ...drawerProps.styles?.content,
                }
            }}
            title={<Flex align={'center'} justify={'space-between'} w={'100%'}>
                {drawerProps.title}
                <Flex ml={'auto'} gap={'xs'}>
                    {
                        ((screenWidth > +width) || fullscreen) && showFullscreenExpandButton &&
                        <Tooltip
                            color={'scBlue'}
                            label={fullscreen ? 'Normal' : 'Full-screen'}
                            openDelay={700}
                        >
                            <ActionIcon
                                variant={'subtle'}
                                onClick={() => setFullscreen(p => {
                                    onFullScreenModeChanges && onFullScreenModeChanges(!p)
                                    return !p
                                })}
                            >
                                {fullscreen ? <IconArrowsDiagonalMinimize2/> : <IconArrowsDiagonal/>}
                            </ActionIcon>
                        </Tooltip>
                    }
                    {
                        drawerProps.withCloseButton !== false &&
                        <CloseButton onClick={drawerProps.onClose}/>
                    }
                </Flex>
            </Flex>}
            keepMounted={false}
            withOverlay={false}
            closeOnClickOutside={false} // doesn't work when overlay is disabled
            withCloseButton={false}
            closeOnEscape={openModals.length === 0}
        >
            {drawerProps.opened && children}
        </Drawer>
    )
};

export default ScDrawer


