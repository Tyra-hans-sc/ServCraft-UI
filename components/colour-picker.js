import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';
import { SketchPicker } from 'react-color';
import { useOutsideClick } from "rooks";

function ColourPicker({ selectedColour, setColour }) {

    const [showPicker, setShowPicker] = useState(false);

    const pickerRef = useRef();
    useOutsideClick(pickerRef, () => {
        if (showPicker) {
            setShowPicker(false);
        }
    });

    return (<>

        <div className="row">
            <div className="column flex-row">
                <div className="color-block b-Red" onClick={() => setColour('Red')}></div>
                <div className="color-block b-Orange" onClick={() => setColour('Orange')}></div>
                <div className="color-block b-Yellow" onClick={() => setColour('Yellow')}></div>
                <div className="color-block b-Green" onClick={() => setColour('Green')}></div>
                <div className="color-block b-Blue" onClick={() => setColour('Blue')}></div>
                <div className="color-block b-Purple" onClick={() => setColour('Purple')}></div>
                <div className="color-block b-Black" onClick={() => setColour('Black')}></div>
                <div className="color-block b-Grey" onClick={() => setColour('Grey')}></div>
                <div className="color-block b-LightGrey" onClick={() => setColour('LightGrey')}></div>
                <div className="color-picker" ref={showPicker ? pickerRef : null}>
                    <div className="color-block add-color" onClick={() => setShowPicker(true)}>+</div>
                    {showPicker
                        ? <SketchPicker
                                disableAlpha={true}
                                color={selectedColour ? selectedColour : undefined}
                                onChangeComplete={(color) => { setColour(color ? color.hex : undefined); }}
                                presetColors={[]}
                        />
                        : ''
                    }
                </div>
            </div>
            <div className="column flex-row">
                <div style={{ marginTop: 24, marginRight: 16 }}>{selectedColour ? "Selected" : "Select Colour"}</div> 
                <div className={"color-block color-block-selected b-" + selectedColour} ></div>
            </div>
        </div>

        <style jsx>{`
        .row {
            display: flex;
            justify-content: space-between;
        }
        
        .column {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        
        .flex-row {
            flex-direction: row;
        }

        .color-block {
            border-radius: ${layout.cardRadius};            
            cursor: pointer;
            height: 2rem;
            margin-right: 1rem;
            margin-top: 1rem;
            position: relative;
            width: 2rem;
            z-index: 1;
            display: inline-block;
          }

          .color-block-selected {
            background-color: ${selectedColour ? selectedColour.includes('#') ? selectedColour : "" : ""};
          }
   
          .color-picker {
            position: relative;
          }
          .color-picker :global(.sketch-picker) {
            left: 0;
            position: absolute;
            top: calc(100% + 0.5rem);
            z-index: 99;
          }

          .add-color {
            align-items: center;
            background: none;
            border: 1px solid ${colors.darkPrimary};
            color: ${colors.darkPrimary};
            display: flex;
            justify-content: center;
          }
  
          /*REMOVE DUPLICATE COLOR CODE*/
          .Red {
            background-color: rgba(252, 46, 80, 0.2); /*#FC2E50;*/
            color: #FC2E50 !important;
          }
          .b-Red {
            background-color: #FC2E50;
          }
          .Orange {
            background-color: rgba(242, 97, 1, 0.2);
            color: #F26101 !important;
          }
          .b-Orange {
            background-color: #F26101;
          }
          .Yellow {
            background-color: rgba(255, 201, 64, 0.2);
            color: #FFC940 !important;
          }
          .b-Yellow {
            background-color: #FFC940;
          }
          .Green {
            background-color: rgba(81, 203, 104, 0.2);
            color: #51CB68 !important;
          }
          .b-Green {
            background-color: #51CB68;
          }
          .Blue {
            background-color: rgba(90, 133, 225, 0.2);
            color: #5A85E1 !important;
          }
          .b-Blue {
            background-color: #5A85E1;
          }
          .Purple {
            background-color: rgba(128, 100, 250, 0.2);
            color: #735AE1 !important;
          }
          .b-Purple {
            background-color: #735AE1;
          }
          .Black {
            background-color: rgba(79, 79, 79, 0.2);
            color: #4F4F4F !important;
          }
          .b-Black {
            background-color: #4F4F4F;
          }
          .Grey {
            background-color: rgba(130, 130, 130, 0.2);
            color: #828282 !important;
          }
          .b-Grey {
            background-color: #828282;
          }
          .LightGrey {
            background-color: rgba(189, 189, 189, 0.2);
            color: #BDBDBD !important;
          }
          .b-LightGrey {
            background-color: #BDBDBD;
          }
    `}</style>
    </>);
}

export default ColourPicker;