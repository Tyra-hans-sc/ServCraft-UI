import useMobileView from "../../../hooks/useMobileView";
import { colors, layout, shadows } from "../../../theme";

export default function SCListCard({ children, background = colors.white, onClick }) {

    const [mobileView] = useMobileView();

    const cardClick = () => {
        onClick && onClick();
    };

    return (<>
        <div className="list-card" onClick={cardClick}>
            {children}
        </div>


        <style jsx>{`
            .list-card {
                display: block;
                margin-top: 0.5rem;
                border-radius: ${layout.bigRadius};
                box-shadow: ${shadows.cardSmall};
                background: ${background};
                padding: 0.5rem;
                cursor: pointer;
                ${mobileView ? "" : `max-width: ${layout.listCardWidth};`}
            }
        `}</style>
    </>);
}