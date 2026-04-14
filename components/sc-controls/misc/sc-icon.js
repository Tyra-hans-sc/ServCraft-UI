export default function SCIcon({ name, onClick, height = "1.5rem", folder = "icons" }) {

    const clicked = () => {
        onClick && onClick();
    };

    return (<>
        <img src={`/${folder}/${name}.svg`} style={{ height: height, cursor: (onClick ? "pointer" : "default") }} onClick={clicked} />
    </>);
}