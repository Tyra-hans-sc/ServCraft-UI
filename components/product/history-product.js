import React, { useState, useRef } from 'react'
import { colors, fontSizes, layout, fontFamily } from '../../theme'
import TextInput from '../text-input'
import useOutsideClick from "../../hooks/useOutsideClick";
import Time from '../../utils/time';

function ProductHistoryProduct({product, selectedProduct, setSelected}) {
  const [showMore, setShowMore] = useState(false)
  
  const ref = useRef();
  useOutsideClick(ref, () => {
    if (showMore) {
      setShowMore(false);
    }
  });

  function employeeDetails() {
    if (product.Employees) {
      let name = product.Employees[0].FirstName + " " + product.Employees[0].LastName;
      if (product.Employees.length > 1) {
        name = name + " + " + (product.Employees.length - 1);
      }
      const initials = product.Employees[0].FirstName[0] + product.Employees[0].LastName[0];
      return [name, initials];
    }
    return ['Unassigned','N/A'];
  }

  const [employeeName, employeeInititials] = employeeDetails();

  function formatDate(closeDate) {
    const date = Time.parseDate(closeDate);
    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];
  
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
  
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }

  return (
    <div className="product">
      <div className="number">
        {product.ProductNumber}
        <p>{product.IsClosed ? "Closed" : "Open"}</p>
      </div>  
      <div className="contact">
        {product.CustomerContactFullName}
      </div>  
      <div className="service">
        {product.InventoryDescription}
        <p>{product.IsClosed ?
            Time.formatDate(product.ClosedDate)
            : ""
          }
        </p>
      </div>  
      <div className="description">
        {product.SerialNumber}
      </div>
      <div className="view" onClick={() => setShowMore(!showMore)} ref={showMore ? ref : null}>
        View
        { showMore ?
          <div className="more">
            <div className="row">
              <h1>{product.ProductNumber}</h1>
              <div className="row">
                <div className="tech">
                  <p>Assigned Employee</p>
                  {employeeName}
                </div>
                <div className={`initials ${product.Employees && product.Employees.length > 1 ? " initials-multiple" : ""}`}>
                  {employeeInititials}
                </div>
              </div>
            </div>
            <p>Location</p>
            {product.LocationDescription}
            <p>Inventory</p>
            {product.InventoryDescription}
            <p>Serial Number</p>
            {product.SerailNumber}
            <p>Invoice Number</p>
            {product.InvoiceNumber}
            <p>Warranty Period</p>
            {product.WarrantyPeriod}
            <p>Purchase Date</p>
            {formatDate(product.PurchaseDate)}
          </div>
          : ""
        }  
      </div>  

      <style jsx>{`
        .product {
          align-items: center;
          background-color: ${colors.background};
          border-radius: ${layout.cardRadius};
          display: flex;
          height: 5.5rem;
          margin-top: 1rem;
          padding: 0 1.5rem;
        }
        
        .number {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 6rem;
        }
        .number p {
          font-size: 0.875rem;
          margin: 4px 0 0 0;
        }
        .contact {
          flex-shrink: 0;
          margin-right: 0.5rem;
          width: 6rem;
        }
        .contact p {
          font-size: 0.875rem;
          margin: 4px 0 0 0;
        }
        .description {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 8rem;
        }
        .description p {
          font-size: 0.875rem;
          font-weight: bold;
          margin: 4px 0 0 0;
        }
        .service {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 9rem;

          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 2;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }
        .view {
          color: ${colors.bluePrimary};
          cursor: pointer;
          font-weight: bold;
          position: relative;
        }
        .more {
          background-color: white;
          box-shadow: 0px 10px 16px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.06);
          color: ${colors.darkPrimary};
          font-weight: normal;
          position: absolute;
          padding: 1.5rem;
          right: 100%;
          top: 100%;
          width: 368px;
        }
        .more p {
          color: ${colors.blueGreyLight};
          font-size: 0.875rem;
          margin: 1rem 0 0.25rem 0
        }
        .more h1 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .tech {
          text-align: right;
        }
        .tech p {
          margin-top: 0;
        }
        .initials {
          align-items: center;
          color: ${colors.white};
          display: flex;
          font-size: 0.875rem;
          height: 2.5rem;
          justify-content: center;
          margin-left: 0.5rem;
          position: relative;
          width: 2.5rem;
          z-index: 2;
        }
        .initials:after {
          background-color: ${colors.bluePrimary};
          border: 2px solid ${colors.white};
          border-radius: 1.25rem;
          box-sizing: border-box;
          content: '';
          height: 2.5rem;
          position: absolute;
          right: 0;
          top: 0;
          width: 2.5rem;
          z-index: -1;
        }
        .initials-multiple:before {
          background-color: ${colors.bluePrimary};
          border: 2px solid ${colors.white};
          border-radius: 1.25rem;
          box-sizing: border-box;
          color: ${colors.white};
          content: '';
          height: 2.5rem;
          position: absolute;
          right: -0.4rem;
          top: 0;
          width: 2.5rem;
          z-index: -1;
        }
      `}</style>
    </div>
  )
}

export default ProductHistoryProduct;
