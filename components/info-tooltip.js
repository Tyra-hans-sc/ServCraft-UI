import { Tooltip } from '@mantine/core';

export default function InfoTooltip({title}) {

    return (
        <div className="tooltip-container">
            <Tooltip label={title}>
                <img src={`/icons/info-bluegrey.svg`} alt="clear" className="icon" height={20} />
            </Tooltip>
            <style jsx>{`
                .tooltip-container {
                    display: flex;
                    padding-top: 0.4rem;
                    padding-left: 0.5rem;
                    position: relative;
                }

                .tooltip-container img {
                    position: absolute;
                    top: 10px;
                }
            `}</style>
        </div>        
    );
};


export function InfoTooltip2({title}) {

    return (
        <div className="tooltip-container">
            <Tooltip label={title}>
                <img src={`/icons/info-bluegrey.svg`} alt="clear" className="icon" height={20} />
            </Tooltip>
            <style jsx>{`
                .tooltip-container {
                    display: inline-block;
                    margin-left: 0.5rem;
                    position: relative;
                }

                .tooltip-container img {
                    position: relative;
                    top: 0.5rem;                    
                }
            `}</style>
        </div>        
    );
};