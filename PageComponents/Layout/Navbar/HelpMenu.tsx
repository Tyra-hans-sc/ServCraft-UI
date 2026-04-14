import React, {FC, useEffect, useState} from "react";
import {IconQuestionCircle} from "@tabler/icons";
import {ActionIcon, Menu, Popover, Tooltip, Text, Button, Flex, CloseButton} from "@mantine/core";
import styles from './ScNavbar.module.css'
import {useMutation, useQuery} from "@tanstack/react-query";
import UserConfigService from "@/services/option/user-config-service";
import * as Enums from '@/utils/enums'
import moment from "moment";
import PS from "@/services/permission/permission-service";

const userConfigHelpOpenedMetadataName = 'hcOpened'

const HelpMenu: FC<{setShowMessagePost: (show: boolean) => void, activateHubspot: () => void, toggleHelp: () => void; helpOpened: boolean, initialSetupShown?: boolean}> = ({setShowMessagePost, activateHubspot, toggleHelp, helpOpened, initialSetupShown} ) => {

    const superAdminUser = PS.hasPermission(Enums.PermissionName.MasterSystemAdmin)

    const [showHint, setShowHint] = useState(false)

    const {data: generalAuthUserConfig, isSuccess: userConfigLoaded} = useQuery(
        ['globalConfig'],
        () => UserConfigService.getPageFilters(Enums.ConfigurationSection.General, undefined)
    )

    useEffect(() => {
        if (generalAuthUserConfig) {
            const lastOpenedDate = UserConfigService.getMetaDataValue(generalAuthUserConfig, userConfigHelpOpenedMetadataName)
            const hcOpened = moment().diff(moment(lastOpenedDate), 'days') < 31
            if(!initialSetupShown && !hcOpened) {
                if(superAdminUser) {
                    console.log('help center hint prevented for master office admin')
                }
                setTimeout(() => {
                    setShowHint(!initialSetupShown && !hcOpened)
                }, 5000)
            }
        }
    }, [generalAuthUserConfig, initialSetupShown, superAdminUser])

    const generalAuthUserConfigMutation = useMutation(
        ['globalConfig'],
        (config) => UserConfigService.saveConfig(config, undefined),
    )

    const handlePostHelpCenterViewedThisMonth = () => {
        if(generalAuthUserConfig) {
            const currentMetaData = JSON.parse(generalAuthUserConfig.MetaData)
            generalAuthUserConfigMutation.mutate({
                ...generalAuthUserConfig,
                MetaData: JSON.stringify({
                    ...currentMetaData,
                    [userConfigHelpOpenedMetadataName]: moment().format()
                })
            })
        }
    }

    /** remove to disable help center notification until better display solution is found **/
    /*useEffect(() => {
        setTimeout(
            () => setShowHint(!getHelpViewed() && !helpOpened && !initialSetupShown), 5000
        )
    }, []);*/

    return <>
        <Menu
            withArrow
            withinPortal
            position={'bottom-start'}
            arrowPosition={'side'}
            shadow={'sm'}
            width={190}
            transitionProps={{
                transition: 'pop-top-left',
                duration: 100
            }}
        >

            <Popover opened={showHint  && !helpOpened && !initialSetupShown}
                     onChange={setShowHint}
                     disabled={superAdminUser}
                     styles={{
                         // arrow: {
                         //     backgroundColor: 'blue'
                         // }
                     }}
                     withArrow
                     withinPortal
                     // offset={15}
            >
                <Popover.Target>
                    <Tooltip label={'Help Centre'} disabled={showHint} color={'scBlue.7'}
                             events={{ hover: true, focus: true, touch: true }}
                    >
                        <ActionIcon
                            variant={'transparent'}
                            color={'scBlue'}
                            onClick={() => {
                                setShowHint(false)
                                toggleHelp()
                                handlePostHelpCenterViewedThisMonth()
                            }}
                            className={showHint ? styles.jello : ''}
                        >
                            <IconQuestionCircle />
                        </ActionIcon>
                    </Tooltip>
                </Popover.Target>

                <Popover.Dropdown bg={'scBlue.5'} c={'white'} maw={300}>
                    <Flex>
                        <Text size={'sm'} >
                            Check out our help centre!
                        </Text>
                        {/*<CloseButton size={'xs'} ml={'auto'} c={'white'} variant={'transparent'} />*/}
                    </Flex>
                    <Text size={'xs'}>
                        Our new help center offers a range of helpful guides and walkthroughs to keep you on track if you ever feel lost.
                    </Text>
                    <Flex >
                        <Button
                            ml={'auto'}
                            size={'compact-xs'}
                            mt={6}
                            variant={'subtle'}
                            color={'scBlue.0'}
                            onClick={() => {
                                setShowHint(false)
                                handlePostHelpCenterViewedThisMonth()
                            }}
                        >
                            Got it
                        </Button>
                    </Flex>
                </Popover.Dropdown>
            </Popover>

            {/*<Menu.Target>
                <Tooltip label={'Learning hub'} color={'scBlue.7'}>
                    <ActionIcon
                        variant={'transparent'}
                        color={'gray.9'}
                        // onClick={() => setShowHelpPopup(!showHelpPopup)}
                        // ref={helpRef}
                    >
                        <IconQuestionCircle />
                    </ActionIcon>
                </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
                <>
                    <div className='text-container'>
                        <div className='text'>
                            Help
                        </div>
                        <div className='separator'></div>
                    </div>
                    <div className='link-container'>
                        <div className='link' onClick={goToLearningCenter} onMouseOver={() => onLearningMouseEvent(true)} onMouseLeave={() => onLearningMouseEvent(false)}>
                            <img src={`/sc-icons/learning-center-${learningMouseOver ? 'light' : 'dark'}.svg`} alt="learn" />
                            Learning Center
                            <img src={`/sc-icons/link-${learningMouseOver ? 'light' : 'dark'}.svg`} alt="link" className='link-button' />
                        </div>

                        <div className='link' onClick={() => setShowMessagePost(true)} onMouseOver={() => onFeedbackMouseEvent(true)} onMouseLeave={() => onFeedbackMouseEvent(false)}>
                            <img src={`/sc-icons/feedback-${feedbackMouseOver ? 'light' : 'dark'}.svg`} alt="feedback" />
                            Give us Feedback
                        </div>

                        <div className='link' onClick={activateHubspot} onMouseOver={() => onChatMouseEvent(true)} onMouseLeave={() => onChatMouseEvent(false)}>
                            <img src={`/sc-icons/chat-${chatMouseOver ? 'light' : 'dark'}.svg`} alt="chat" />
                            Start a Chat
                        </div>
                    </div>

                    <style jsx>{`
                    .popup.show {
                        display: block;
                    }
                    .popup:after,
                    .popup:before {
                        bottom: 100%;
                        border: solid transparent;
                        content: " ";
                        height: 0;
                        width: 0;
                        position: absolute;
                        pointer-events: none;
                    }

                    .popup:after {
                        border-color: rgba(255, 255, 255, 0);
                        border-bottom-color: #ffffff;
                        border-width: 8px;
                        left: 95%;
                        margin-left: -19px;
                    }

                    .popup:before {
                        border-color: rgba(255, 255, 255, 0);
                        border-bottom-color: white;
                        border-width: 8px;
                        left: 95%;
                        margin-left: -20px;
                    }
                    .text-container {
                        padding: 0 1rem;
                    }
                    .text {
                        color: ${colors.subHeading};
                        display: flex;
                        flex-direction: column;
                        font-size: 12px;
                        text-align: left;
                        margin-bottom: 0.25rem;
                    }
                    .separator {
                        width: 13px;
                        height: 0px;
                        border: 1px solid ${colors.bluePrimary};
                    }
                    .link-container {
                        margin-top: 0.5rem;                          
                    }
                    .link {
                        min-width: 146px;
                        position: relative;
                        align-items: center;
                        color: ${colors.darkPrimary};
                        cursor: pointer;
                        display: flex;
                        font-size: 12px;
                        text-align: left;
                        white-space: nowrap;
                        height: 30px;
                        padding: 0.25rem 1rem;
                    }
                    .link img {
                      margin: 0 0.5rem 0 0;
                    }
                    .link:hover {
                      background-color: var(--mantine-color-scBlue-7);
                      color: ${colors.white};
                    }
                    .link-button {
                        position: absolute;
                        right: 1rem;
                    }
                `}</style>

                </>
            </Menu.Dropdown>*/}
        </Menu>
    </>
}

export default HelpMenu
