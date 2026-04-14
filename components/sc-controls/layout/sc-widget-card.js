import { colors, shadows } from "../../../theme";
import IF from "../logical/if";
import SCIcon from "../misc/sc-icon";
import { Card, Stack } from "@mantine/core";

export default function SCWidgetCard({ children, onDismiss, padding = 0, background = "white", animatedOnHover = false, height = '100%' }) {

    const dismiss = () => {
        onDismiss && onDismiss();
    };

    return (<>
        <Card className={animatedOnHover ? "scwidget-card-container" : ""} shadow="sm" mih={100} padding={0} h={height} radius="md" mx={0} withBorder p={padding} bg={background}>
            {children}
            {
                onDismiss &&
                <div className="dismiss-button">
                    <SCIcon name="cross-white" onClick={dismiss} />
                </div>
            }
        </Card>

        <style jsx>{`
            .dismiss-button {
                position: absolute;
                right: 0.5rem;
                top: 0.5rem;
                transition-duration: 0.2s;
                transition-timing-function: ease-out;
            }

            .dismiss-button:hover {
                transform: scale(1.3);
            }

            :global(.scwidget-card-container) {
                transition: 0.25s;
            }
            :global(.scwidget-card-container):hover {
                transition: 0.25s;
                //background: #0000000a !important;
                transform: translate(-2px, -2px);
                box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0 0.625rem 0.9375rem -0.3125rem, rgba(0, 0, 0, 0.1) 0 0.4375rem 0.4375rem -0.3125rem;
            }

        `}</style>

    </>);
}
