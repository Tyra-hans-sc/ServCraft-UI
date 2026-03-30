import React/*, { useState }*/, {useState} from 'react';
// import { colors} from '../theme';
import PageTabs  from '../PageComponents/Layout/PageTabs';
import {colors} from "../theme";

// const useNewTabs = true;

function Tabs(props) {

  const [showTab1Count, setShowTab1Count] = useState(props.showTab1Count ? props.showTab1Count : false);

  return (
      props.useNewTabs ?
          <PageTabs {...props} /> : <>
            <div className="tabs">
              {props.tabs.map((tab, key) =>
                  <div className={`tab ${tab.text == props.selectedTab ? "tab-selected" : ""}`} key={key}
                       onClick={() => props.disabled !== true && props.setSelectedTab(tab.text)}
                       style={tab.fitContent ? {width: "fit-content"} : {}}>
                    {tab.text}
                    {(key != 0 || showTab1Count) && !tab.suppressCount
                        ? <div className="count">
                          {tab.count}
                        </div>
                        : ''
                    }
                  </div>
              )}

              {/* <span className="horizontal-line"></span> */}

              <style jsx>{`
                .tabs {
                  display: flex;
                  ${props.noMarginTop ? "" : props.smallMarginTop ? "margin-top: 0.5rem;" : "margin-top: 0.5rem;"}
                  width: 100%;
                  position: relative;
                }

                .tab {
                  align-items: center;

                  border-radius: 4px 4px 0px 0px;
                  box-sizing: border-box;
                  color: ${colors.blueGrey};
                  cursor: ${(props.disabled === true ? "not-allowed" : "pointer")};
                  display: flex;
                  flex-grow: 1;
                  height: 2.5rem;
                  justify-content: space-between;
                  padding: 0 1rem;
                  background-color: ${colors.formGrey};
                }

                .tab-selected {
                  background-color: ${colors.white};
                  border-bottom: 3px solid ${colors.bluePrimary};
                  box-shadow: 8px 4px 4px rgba(178, 194, 205, 0.2);
                  /*z-index: 1;*/
                }

                .tab-selected:hover {
                  background-color: ${colors.white};
                }

                .tab:hover {
                  ${props.disabled === true ? `` : `
                      background-color: ${colors.white};
                    `}
                }

                .tab + .tab {
                  margin-left: 0.25rem;
                }

                .horizontal-line {
                  width: 100%;
                  position: absolute;
                  left: 0;
                  bottom: 0;
                  border-bottom: 3px solid ${colors.blueGreyLight};
                }

                .count {
                  align-items: center;
                  background-color: ${colors.blueGreyLight};
                  border-radius: 0.75rem;
                  color: ${colors.white};
                  display: flex;
                  font-size: 0.75rem;
                  font-weight: bold;
                  height: 1.5rem;
                  justify-content: center;
                  width: 1.5rem;
                }

                .tab-selected .count {
                  background-color: ${colors.bluePrimary};
                }
              `}</style>
            </div>
          </>

  )
}

export default Tabs;
