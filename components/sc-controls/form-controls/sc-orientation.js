import { colors } from '../../../theme';
import * as Enums from '../../../utils/enums';
import KendoTooltip from '../../kendo/kendo-tooltip';

export default function SCOrientation({ name, value, onChange }) {

    const updateOrientation = (orientation) => {
        onChange && onChange({ name: name, value: orientation });
    };

    return (<>
        <div className="orientation-container">
            {value === Enums.Orientation.Portrait ? <>
                <div className="inline">
                    <div className="icon-container highlighted">
                        <img src="/sc-icons/portrait-blue.svg" width="28" className="pointer" title="Portrait"
                            onClick={() => updateOrientation(Enums.Orientation.Portrait)} />
                    </div>
                    <div className="icon-container">
                        <img src="/sc-icons/landscape-black.svg" height="24" className="pointer" title="Landscape"
                            onClick={() => updateOrientation(Enums.Orientation.Landscape)} />
                    </div>
                </div>
            </> :
                value === Enums.Orientation.Landscape ? <>
                    <div className="inline">
                        <div className="icon-container">
                            <img src="/sc-icons/portrait-black.svg" width="28" className="pointer" title="Portrait"
                                onClick={() => updateOrientation(Enums.Orientation.Portrait)} />
                        </div>
                        <div className="icon-container highlighted">
                            <img src="/sc-icons/landscape-blue.svg" height="24" className="pointer" title="Landscape"
                                onClick={() => updateOrientation(Enums.Orientation.Landscape)} />
                        </div>
                    </div>
                </>
                    : "Unknown Orientation"
            }
        </div>

        <style jsx>{`

        .orientation-container {
            margin-top: 1.25rem;
        }

        .inline {
            display: flex;
            align-items: end;
        }

        .inline img {
            vertical-align: bottom;
        }

        .pointer {
            cursor: pointer;
        }

        .icon-container {
            padding: 0.25rem;
        }
        .icon-container.highlighted {
            background: ${colors.backgroundGrey};
            border-radius: 3px;
        }
        
        `}</style>
    </>);
}