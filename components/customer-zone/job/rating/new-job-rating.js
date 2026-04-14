import React, { useState, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../../theme';
import * as Enums from '../../../../utils/enums';
import StarRating from '../../../job/rating/star-rating';
import TextArea from '../../../text-area';
import Button from '../../../button';
import ToastContext from '../../../../utils/toast-context';
import { errors } from '@telerik/kendo-intl';

function NewJobRating({setShow, mobileView, defaultRating, jobCard, customerID, contactID, company, onSubmit}) {

    const toast = useContext(ToastContext);
    const [inputErrors, setInputErrors] = useState({});

    const [rating, setRating] = useState(defaultRating);

    const ratingChange = (ratingUpdate) => {
        setRating(ratingUpdate);
    };

    const commentMaxLength = 1000;
    const [comment, setComment] = useState('');

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const validate = () => {   
            
        if (comment.length > commentMaxLength) {
            let message = `Comment cannot be more than ${commentMaxLength} characters`;
            errors['Comment'] = message;
            setInputErrors(errors);
            return {isValid: false, message: message}
        } 
        
        if (!rating || rating <= 0) {
            setInputErrors({});
            return {isValid: false, message: `Please rate us`}
        }

        setInputErrors({});
        return {isValid: true, message: ``};
    };

    const submit = async () => {

        let {isValid, message} = validate();

        if (isValid) {
            onSubmit(rating, comment);
        } else {
            toast.setToast({
                message: message,
                show: true,
                type: Enums.ToastType.error,
            });
        }
    };

    const sharedContent = () => {
        return (
            <>
                <div className='title'>
                    Tell us what you think
                </div>

                <div className='sub-title'>
                    How would you rate your experience with <b>{company.Name}</b> out of 5 stars?
                </div>

                <hr />

                <div className='star-rating'>
                    {StarRating(rating, true, ratingChange)}
                </div>

                <div className='comment'>
                    <TextArea placeholder="Tell us why you chose this score" 
                        changeHandler={handleCommentChange} 
                        value={comment} 
                        rows={5}
                        error={inputErrors.Comment}
                    />
                </div>

                <div className='actions'>
                    <Button text={'Submit'} icon="send-white" extraClasses="auto" onClick={submit} />
                </div>

                <style jsx>{` 
                    .title {
                        font-size: 1.125rem;
                        font-weight: bold;
                    }
                    .sub-title {

                    }
                    hr {
                        margin-top: 1rem;
                        border-top 1px solid ${colors.blueGreyLight};
                    }
                    .star-rating {
                        display: flex;
                        justify-content: center;
                        margin-top: 2rem;
                    }
                    .comment {
                        margin-top: 1rem;
                    }
                    .actions {
                        display: flex;
                        justify-content: flex-end;
                    }
                `}</style>
            </>
        )
    };

    const mobileContent = () => {
        return (
            <div className='job-rating-container'>
                {sharedContent()}
                <style jsx>{`
                    .job-rating-container {
                        position: relative;
                        top: 0;
                        left: 0;
                        background-color: white;
                        padding: 1rem 1rem;
                    }  
                `}</style>
            </div>
        );
    };

    const desktopContent = () => {
        return (
            <div className='job-rating-container' onClick={(e) => e.stopPropagation()}>
                <div className='modal-container'>

                    <div className='close-button'>
                        <img src="/icons/x.svg" onClick={() => setShow(false)} title="Close" />
                    </div>

                    {sharedContent()}
                </div>                

                <style jsx>{`
                    .job-rating-container {
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
                    .close-button {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        cursor: pointer;
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

export default NewJobRating;
