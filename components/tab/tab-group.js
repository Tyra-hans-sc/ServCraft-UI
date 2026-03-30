import {useState} from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Tab from "./tab";
import Button from '../button';
import * as Enums from '../../utils/enums';
import NoSsr from '../../utils/no-ssr';

function TabGroup({tabs, onTabClick, onActionButtonClick, accessStatus}) {

    const getActiveTabID = () => {
        return tabs.find(x => x.isActive === true).id;
    };

    return (
        <NoSsr>
            <div className='tabgroup-container'>
                {tabs && tabs.map((tab) => {
                        return <>
                            <Tab key={tab.id} id={tab.id} text={tab.text} width={tab.width} onClick={onTabClick} isActive={tab.isActive} isLast={tabs.length === tab.id} />

                            {tabs.length === tab.id ? 
                                <div className='action-button'>
                                    <Button text="Create" icon="plus-circle" extraClasses="fit-content no-margin dark-blue-action" 
                                        onClick={() => onActionButtonClick(getActiveTabID())} 
                                        disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                    />
                                </div> : ''
                            }
                        </>
                    })}
            </div>
                
            {tabs && tabs.map((tab) => {
                return <>
                    {tab.isActive ?
                        <>                                
                            {tab.children}
                        </>
                        : ''
                    }
                </>
            })}
            
            <style jsx>{`
                .tabgroup-container {
                    position: relative;                    
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    color: white;
                    background-color: ${colors.bluePrimaryDark};
                    height: 50px;
                }
                .action-button {
                    display: flex;
                    position: absolute;
                    right: 1rem;
                    top: 0.3rem;
                }
            `}</style>
        </NoSsr>        
    )
}

export default TabGroup;
