import SCWidgetDownloadApp from "../../sc-controls/widgets/sc-widget-download-app";
import SCModal from "@/PageComponents/Modal/SCModal";
import {Box, Text} from "@mantine/core";

export default function MobileViewAlert({ onDismiss }) {

    return (<>

        <SCModal onClose={onDismiss} open={true} withCloseButton>
            <Box py={5}><Text c={'scBlue.9'} fw={600} size={'xl'}>Mobile View Not Supported</Text></Box>
            <p>
                Hello, and thank you for choosing ServCraft.
            </p>
            <p>
                It looks like you&apos;re trying to log into ServCraft&apos;s web application on your phone. Our web application is best experienced on a computer.
            </p>
            <p>
                For best results on your phone, please download our mobile app from one of the options below.
            </p>
            <p>
                If you get stuck or have any questions our team are here to help, <a href="mailto:support@servcraft.co.za?subject=Mobile View Not Supported">support@servcraft.co.za</a>
            </p>


            <SCWidgetDownloadApp padding="0" limitByUserAgent={true} />
        </SCModal>

        <style jsx>{`
        
        `}</style>
    </>);
}