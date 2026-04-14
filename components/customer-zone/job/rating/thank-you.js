import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../../theme';

function JobRatingThankYou({mobileView, company}) {

    const sharedContent = () => {
        return (
            <>
                <div className='title'>
                    Thank you for your feedback
                </div>

                <hr className='grey-hr' />

                <div className='body'>
                    We appreciate the time you took to help us improve! Thank you for being a valued customer.
                    <div className='company'>
                        {company.Name} Team
                    </div>
                </div>

                <style jsx>{`
                    .title {
                        color: ${colors.darkPrimary};
                        font-size: 1.125rem;
                        font-weight: bold;
                        margin-bottom: 1rem;
                    }
                    hr.grey-hr {
                        border-top 1px solid ${colors.borderGrey};
                    }
                    .body {
                        margin-top: 1rem;
                    }
                    .company {
                        margin-top: 1rem;
                        margin-bottom: 1rem;
                    }
                `}</style>
            </>
        );
    };

    const mobileContent = () => {
        return (
            <div className='thankyou-container'>
                {sharedContent()}
                <style jsx>{`
                    .thankyou-container {
                        position: absolute;
                        top: 0;
                        left: 0;
                        background-color: white;
                        padding: 1rem 1rem;
                        height: 100vh;
                    }
                `}</style>
            </div>
        );
    };

    const desktopContent = () => {
        return (
            <div className='thankyou-container' onClick={(e) => e.stopPropagation()}>
                <div className='modal-container'>
                    {sharedContent()}
                </div>                

                <style jsx>{`
                    .thankyou-container {
                        align-items: center;
                        bottom: 0;
                        display: flex;
                        justify-content: center;
                        left: 0;
                        position: relative;
                        right: 0;
                        margin-top: 50vh;
                        transform: translateY(-50%);
                    }  
                    .modal-container {
                        position: relative;
                    }
                `}</style>
            </div>
        );
    };

    return (
        <>
            {mobileView ? mobileContent() : desktopContent()}
        </>
    )
}

export default JobRatingThankYou;
