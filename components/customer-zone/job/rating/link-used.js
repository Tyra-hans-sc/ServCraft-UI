import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../../theme';

function JobRatingLinkUsed({mobileView, company, jobCard}) {

    const sharedContent = () => {
        return (
            <>
                <div className='title'>
                    This feedback link has already been used.
                </div>

                <hr className='grey-hr' />

                <div className='body'>
                    Please contact {company.Name} to provide feedback on Job {jobCard.JobCardNumber}
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
            <div className='linkused-container'>
                {sharedContent()}
                <style jsx>{`
                    .linkused-container {
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
            <div className='linkused-container' onClick={(e) => e.stopPropagation()}>
                <div className='modal-container'>
                    {sharedContent()}
                </div>                

                <style jsx>{`
                    .linkused-container {
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

export default JobRatingLinkUsed;
