import {Modal, useMantineTheme, Title, Text} from "@mantine/core";
import styles from  './Login.module.css';
import {useMediaQuery} from "@mantine/hooks";

const LoginModal = ({open, children}) => {

    const isMobile = useMediaQuery('(max-width: 600px)');

    const theme = useMantineTheme();

    /*iterated to display svg lines on right section*/
    const lineVectors = ['','','','','','','',''];
    const maxWidthForMobileView = 500;

    return <Modal
        size="xl"
        withCloseButton={false}
        centered
        fullScreen={false}
        opened={open}
        onClose={() => {}}
        overlayProps={{
            blur: 10,
            opacity: .55,
            color: theme.colors.scBlue[5]
        }}
        transitionProps={{
            transition: 'pop',
            duration: 250,
            exitDuration: 200,
            timingFunction: 'ease'
        }}
        radius={'sm'}
        padding={0}
    >

        <div className={styles.modalContentContainer} style={{position: 'relative', flexDirection: isMobile ? 'column' : 'row'}}>

            <div className={styles.leftSection} style={{padding: 'var(--mantine-spacing-lg)'}}>
                {children}
            </div>

            <div className={styles.rightSection} style={isMobile ? { minHeight: '200px', maxWidth: '100%', paddingInline: 0} : {maxWidth: '288px', minWidth: '150px'}}>
                {/*vector lines effect*/}
                <div style={{display: isMobile ? 'none' : 'block', position: 'absolute', left: -75}}>
                    {
                        lineVectors.map(
                            (x, i) => (
                                <svg
                                    key={'vector' + i}
                                    style={{position: 'absolute', left: i * 15, opacity: 0.5 - 0.05 * i}}
                                    width="56" height="622" viewBox="0 0 56 622" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.592 -6.15845C32.4488 18.44 26.4965 45.9327 22.8938 74.0682C21.1708 87.8948 20.3877 102.043 23.0505 116.512C31.0391 159.439 52.8119 168.764 55.1615 222.141C55.788 235.485 47.9561 253.171 39.1843 273.107C18.3514 320.214 5.35034 373.269 5.50698 409.283C5.50698 411.855 5.50694 414.267 5.66358 416.518C7.85652 454.46 25.4001 481.47 26.6532 515.554C26.9665 523.272 26.1833 531.31 24.3036 539.831C17.7248 568.932 8.95297 597.389 0.651123 626.65" stroke="white" />
                                </svg>
                            )
                        )
                    }
                </div>

                <div className={styles.rightSectionContainer}>
                    <div className={styles.scLogoContainer}>
                        <img src="logo-white.svg" width={40} height={40} alt=""/>
                    </div>
                    <div>
                        <Title size={'xx-large'} fw={'bolder'} mt={'var(--mantine-spacing-sm)'}>ServCraft</Title>
                        <Text size={'sm'}>Take control of your business.</Text>
                    </div>
                </div>

            </div>

        </div>

    </Modal>
}

// const LoginModal: FC<{open: boolean; params: ParsedUrlQuery}> = ({open, params}) => {

//     const theme = useMantineTheme();

//     /*iterated to display svg lines on right section*/
//     const lineVectors = ['','','','','','','',''];
//     const maxWidthForMobileView = 500;

//     return <Modal
//         size="xl"
//         withCloseButton={false}
//         fullScreen={false}
//         opened={open}
//         onClose={() => {}}
//         overlayColor={theme.colors.blue[5]}
//         overlayBlur={5}
//         overlayOpacity={.55}
//         transition="pop"
//         exitTransitionDuration={200}
//         transitionDuration={250}
//         transitionTimingFunction="ease"
//         radius={'sm'}
//         padding={0}
//     >

//         <MediaQuery
//             query={`(max-width: ${maxWidthForMobileView}px)`}
//             styles={{ flexDirection: 'column-reverse'}}
//         >
//             <div className={styles.modalContentContainer}>

//                 <div className={styles.leftSection} style={{padding: theme.gap.lg}}>
//                     <LoginForm params={params}  />
//                 </div>


//                 <MediaQuery
//                     query={`(max-width: ${maxWidthForMobileView}px)`}
//                     styles={{ minHeight: '200px', maxWidth: '100%', flex: 2}}
//                 >
//                     <div className={styles.rightSection}>
//                     {/*vector lines effect*/}
//                     <MediaQuery
//                         query={`(max-width: ${maxWidthForMobileView}px)`}
//                         styles={{ display: 'none'}}
//                     >
//                         <div style={{position: 'absolute', left: -75}}>
//                             {
//                                 lineVectors.map(
//                                     (x, i) => (
//                                         <svg
//                                             key={'vector' + i}
//                                             style={{position: 'absolute', left: i * 15, opacity: 0.5 - 0.05 * i}}
//                                             width="56" height="622" viewBox="0 0 56 622" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                             <path d="M14.592 -6.15845C32.4488 18.44 26.4965 45.9327 22.8938 74.0682C21.1708 87.8948 20.3877 102.043 23.0505 116.512C31.0391 159.439 52.8119 168.764 55.1615 222.141C55.788 235.485 47.9561 253.171 39.1843 273.107C18.3514 320.214 5.35034 373.269 5.50698 409.283C5.50698 411.855 5.50694 414.267 5.66358 416.518C7.85652 454.46 25.4001 481.47 26.6532 515.554C26.9665 523.272 26.1833 531.31 24.3036 539.831C17.7248 568.932 8.95297 597.389 0.651123 626.65" stroke="white" />
//                                         </svg>
//                                     )
//                                 )
//                             }
//                         </div>
//                     </MediaQuery>

//                     <div className={styles.rightSectionContainer}>
//                         <div className={styles.scLogoContainer}>
//                             <img src="logo-white.svg" width={40} height={40} alt=""/>
//                         </div>
//                         <div>
//                             <Title size={'xx-large'} fw={'bolder'} mt={'sm'}>ServCraft</Title>
//                             <Text size={'sm'}>Take control of your business.</Text>
//                         </div>
//                     </div>


//                 </div>
//                 </MediaQuery>

//             </div>
//         </MediaQuery>
//     </Modal>
// }

export default LoginModal;
