import { colors } from '../theme';

export default function NewTag({ marginTop, marginLeft, title }) {
    return (<>
        <span className="new-tag" title={title}>NEW</span>

        <style jsx>{`
    
        .new-tag {
            display: inline-block;
            float: right;
            font-size: 0.5rem;
            color: ${colors.white};
            padding: 2px;
            border: 1px solid ${colors.white};
            background: ${colors.green};
            ${marginTop ? `margin-top: ${marginTop};` : ""}
            ${marginLeft ? `margin-left: ${marginLeft};` : ""}
        }

        .new-tag.inverted {
            color: ${colors.green};
            border: 1px solid ${colors.green};
            background: ${colors.white};
        }
    
    `}</style>
    </>);
}