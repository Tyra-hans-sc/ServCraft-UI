import React from 'react'
import { colors, fontSizes, layout, fontFamily } from '../../theme'
import TextInput from '../text-input'
import ProductHistoryProduct from '../product/history-product'
import {Loader} from "@mantine/core";

function ProductHistory(props) {

  return (
    <div className="container">
      {
          props.products.length > 0 ?
        <div className="products">
          <h2>{`Asset history for ${props.customer}`}</h2>
          <div className="titles">
            <p>Asset Number</p>
            <p className="contact">Contact</p>
            <p>Inventory</p>
            <p>Serial No</p>
          </div>
          {props.products.map(function(product, index){
            return <ProductHistoryProduct product={product} selectedProduct={props.selectedProduct} setSelected={props.setSelectedProduct} key={index}/>
          })}
          {props.canLoadMoreProducts ?
            <div className="more" onClick={props.loadMoreProducts}>
              Load More
            </div>
            : ""
          }  
        </div>
        :
          <div className="empty">
            <img src="/job-folder.svg" alt="Product Folder" />
              {
                  props.customer !== "" ? <>
                          <h3>{props.customer}</h3>
                          {
                              props.productSearching ? <>
                                      <Loader size={18} />
                                  </> :
                                  <p>This customer has no previous assets</p>
                          }
                      </> :
                      <>
                      <h3>History</h3>
                          <p>Once you select a customer <br/> we will show a list of their previous assets.</p>
                      </>
              }
          </div>

      }

        <style jsx>{`
            .container {
                background-color: ${colors.white};
                border-radius: ${layout.cardRadius};
                display: flex;
                flex-direction: column;
          flex-shrink: 0;
          height: fit-content;
          margin-left: 1.5rem;
          padding: 1.5rem;
          width: 640px;
        }
        .products h2{
          color: ${colors.blueGrey};
          font-size: 24px;
          font-weight: normal;
          margin: 0 0 0.75rem;
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
        .contact {
          margin-right: 3rem !important;
        }
        .product {
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
  )
}

export default ProductHistory
