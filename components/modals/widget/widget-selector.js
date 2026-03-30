import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import Button from '../../button';
import WidgetService from '../../../services/option/widget-service';

function WidgetSelector({ widgetEnums, authWidgets, onChange }) {

    const onWidgetChange = (widgetEnum) => {
        let authWidget = authWidgets.find(x => x.Widget == widgetEnum);

        if (authWidget) {
            authWidget.View = !authWidget.View;
        }
        onChange(authWidgets);
    };

    const splitWidgetWords = (widgetEnum) => {
        return Enums.getEnumStringValue(Enums.Widgets, widgetEnum, widgetEnum != Enums.Widgets.YouTube);
    };

    const getCheckboxValue = (widgetEnum) => {
        let authWidget = authWidgets.find(x => x.Widget == widgetEnum);
        if (authWidget) {
            return authWidget.View;
        } else {
            return false;
        }
    };

    return (
        <div className="overlay" onClick={(e) => e.stopPropagation()}>
            <div className="modal-container">

                <div className="title">
                    <h1>Toggle Widgets</h1>
                </div>

                {widgetEnums && widgetEnums.filter(x => authWidgets.find(y => y.Widget === x)).map((widgetEnum, index) => {
                    return <div className="row" key={index}>
                        <div className="column">
                            <SCCheckbox
                                name={widgetEnum}
                                label={splitWidgetWords(widgetEnum)}
                                value={getCheckboxValue(widgetEnum)}
                                onChange={() => onWidgetChange(widgetEnum)}
                            />
                        </div>
                    </div>
                })}

                <div className="row">
                    <div className="cancel">
                        <Button text="Close" onClick={() => onChange(null)} extraClasses="fit-content no-margin hollow" />
                    </div>
                </div>

            </div>

            <style jsx>{`
                .widget-container {
                    display: flex;
                    margin-top: 0.5rem;
                }
                .title {
                    color: ${colors.bluePrimary};
                    font-size: 1.125rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                }
                .row {
                    display: flex;
                    justify-content: space-between;
                }
                .column {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                  }
                .column + .column {
                    margin-left: 1.25rem;
                }
                .cancel {
                    margin-top: 1rem;
                }
            `}</style>
        </div>
    )
}

export default WidgetSelector;
