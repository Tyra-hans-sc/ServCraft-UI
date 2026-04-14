import React from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';

function DetailCard({contact, location, index, deleteFunc, editFunc}) {

  let locationType = ""
  if (location) {
    switch (location.LocationType) {
      case 0 :
        locationType = "Delivery";
        break;
      case 1:
        locationType = "Postal";
        break;
      default:
        locationType = location.LocationType;
    }
  }

  return (
    <div className="container">
      { contact
        ? <>
            <img src="/icons/user.svg" alt="contact" />
            <h2>{contact.FirstName + " " +  contact.LastName + (index == 0 ? " (Primary)" : "")}</h2>
            <p>{contact.EmailAddress}</p>
            <p>{contact.MobileNumber}</p>
            <div className="actions">
              {index != 999 
                ? <img src="/icons/edit-bluegrey.svg" alt="edit" onClick={() => editFunc(index, 'contact')}/>
                : ""
              }
              <img src="/icons/trash-bluegrey.svg" alt="trash" onClick={() => deleteFunc(index, 'contact')}/>
            </div>
          </>
        : ""
      }
      { location
        ? <>
            <img src="/icons/building.svg" alt="location" />
            <h2>{location.Description + (index == 0 ? " (Primary)" : "")}</h2>
            <p>{location.AddressLine1}</p>
            <p>{location.AddressLine2}</p>
            <p>{location.AddressLine3}</p>
            <p>{locationType}</p>
            <p>{location.CountryDescription}</p>
            <div className="actions">
              {index != 999 
                ? <img src="/icons/edit-bluegrey.svg" alt="edit" onClick={() => editFunc(index, 'location')}/>
                : ""
              }
              <img src="/icons/trash-bluegrey.svg" alt="trash" onClick={() => deleteFunc(index, 'location')}/>
            </div>
          </>
        : ""
      }
      <style jsx>{`
        .container {
          align-items: flex-start;
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-shadow: 0px 8px 16px rgba(51, 51, 51, 0.1);
          display: flex;
          flex-direction: column;
          height: fit-content;
          margin-top: 1rem;
          padding: 1rem;
          position: relative;
          width: 100%;
        }
        h2 {
          font-size: 1rem;
          margin: 1rem 0 0.5rem;
        }
        p {
          color: ${colors.blueGrey};
          font-size: 0.875rem;
          line-height: 1.375rem;
          margin: 0;
        }
        .actions {
          display: flex;
          position: absolute;
          right: 1rem;
          top: 1rem;
        }
        .actions :global(img){
          cursor: pointer;
          margin-left: 0.75rem;
        }
      `}</style>
    </div>
  )
}

export default DetailCard
