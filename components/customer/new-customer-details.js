import React from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Helper from '../../utils/helper';
import DetailCard from './detail-card';

function NewCustomerDetails({inputs, selectedLocationType, selectedCountry, selectedDesignation, contacts, locations, editFunc, deleteFunc}) {

    const anyContactInputs = (inputs.FirstName != '' || inputs.LastName != '' || inputs.EmailAddress != '' || inputs.MobileNumber != '' || selectedDesignation ? true : false);
    const anyLocationInputs = (!Helper.isNullOrUndefined(selectedCountry) || inputs.LocationName != '' || inputs.AddressLine1 != '' || inputs.AddressLine2 != '' 
        || inputs.AddressLine3 != '' || !Helper.isNullOrUndefined(selectedLocationType) ? true : false);

    return (
        <div className="container">
            { contacts.length > 0 || anyContactInputs ? 
                <>
                    <h3>Customer Contact Details</h3>
                    { contacts.length > 0 ? 
                        contacts.map((contact, index) => <DetailCard contact={contact} index={index} key={index} deleteFunc={deleteFunc} editFunc={editFunc} />)
                        : ''
                    }
                    { anyContactInputs ?  
                        <DetailCard 
                            contact={{FirstName: inputs.FirstName, LastName: inputs.LastName, EmailAddress: inputs.EmailAddress, MobileNumber: inputs.MobileNumber, 
                                Designation: selectedDesignation}}
                            index={999} 
                            key={999} 
                            deleteFunc={deleteFunc}
                        />
                        : ''
                    }
                </>
                : ''
            }
        { locations.length > 0 || anyLocationInputs
            ? <>
                <h3 className="margin-header">Customer Location Details</h3>
                { locations.length > 0 ? 
                    locations.map((location, index) => <DetailCard location={location} index={index} key={index} deleteFunc={deleteFunc} editFunc={editFunc} />)
                    : ''
                }
                { anyLocationInputs ?  
                    <DetailCard 
                        location={{AddressLine1: inputs.AddressLine1, AddressLine2: inputs.AddressLine2, AddressLine3: inputs.AddressLine3, Description: inputs.LocationName, 
                            CountryDescription: selectedCountry ? selectedCountry.Description : '', LocationType: selectedLocationType}} 
                        index={999} 
                        key={999} 
                        deleteFunc={deleteFunc}
                    />
                    : ''
                }
            </>
            : ''
        }
        { locations.length == 0 && !anyLocationInputs && contacts.length == 0 && !anyContactInputs
            ? <div className="empty">
                <img src="/customer-list.svg" alt="Job Folder" />
                <h3>Create new customers</h3>
                <p>Add new individuals or companies <br/> quick and easy</p>
            </div>
            : ''
        }
        <style jsx>{`
            .container {
            border-radius: ${layout.cardRadius};
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            height: fit-content;
            margin-left: 1.5rem;
            padding: 1.5rem;
            width: 520px;
            }
            h3 {
            color: ${colors.blueGrey};
            font-size: 1rem;
            margin: 0;
            }
            .margin-header {
            margin-top: 2rem;
            }
            .empty {
            align-items: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 1rem 0;
            }
            .empty img {
            height: 110px;
            margin-bottom: 1rem;
            }
            .empty h3 {
            color: ${colors.darkSecondary};
            font-size: 16px;
            margin: 0 0 0.75rem;
            }
            .empty p {
            color: ${colors.blueGrey};
            margin: 0;
            text-align: center;
            }
            .titles {
            display: flex;
            padding-left: 0.5rem;
            }
            .titles p {
            color: ${colors.darkPrimary};
            font-weight: bold;
            margin: 0 1.5rem 0 0;
            }
            .titles p:last-child {
            padding-left: 5rem;
            }
            .job {
            align-items: center;
            background-color: ${colors.background};
            border-radius: ${layout.cardRadius};
            display: flex;
            height: 5.5rem;
            margin-top: 1rem;
            padding: 0 1.5rem;
            }
            .radio {
            border: 1px solid ${colors.blueGreyLight};
            border-radius: 0.75rem;
            box-sizing: border-box;
            cursor: pointer;
            flex-shrink: 0;
            height: 1.5rem;
            margin-right: 2.5rem;
            position: relative;
            width: 1.5rem;
            }
            .radio-selected {
            border: 1px solid ${colors.bluePrimary};
            }
            .radio-selected:after {
            background-color: ${colors.bluePrimary};
            border-radius: 0.5rem;
            content: '';
            height: 1rem;
            left: 3px;
            position: absolute;
            top: 3px;
            width: 1rem;
            }
            .service {
            flex-shrink: 0;
            margin-right: 1.5rem;
            width: 5.5rem;
            }
            .service p {
            font-size: 14px;
            font-weight: bold;
            margin: 4px 0 0 0;
            }
            .description {
            flex-grow: 1;
            max-height: 2.5rem;
            overflow: hidden;
            padding-right: 1.5rem;
            }
            .view {
            color: ${colors.bluePrimary};
            cursor: pointer;
            font-weight: bold;
            }
            .more {
            align-items: center;
            border: 1px solid ${colors.bluePrimary};
            border-radius: ${layout.cardRadius};
            color: ${colors.bluePrimary};
            cursor: pointer;
            display: flex;
            font-weight: bold;
            height: 2.5rem;
            justify-content: center;
            margin-top: 1rem;
            }
        `}</style>
        </div>
    );
}

export default NewCustomerDetails;
