import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';

const StarRating = (rating = 0, editable = false, onClick = null) => {

    const getStarTopPosition = (starItem) => {
        let position = 0;
        let selectedStar = rating >= starItem;

        if (editable) {
            if (selectedStar) {
                position = 0;
            } else {
                position = 6;
            }
        } else {
            if (selectedStar) {
                position = -1;
            } else {
                position = 2;
            }
        }
        return position;
    };

    const getStarLeftPosition = (starItem) => {
        let position = 0;
        let selectedStar = rating >= starItem;

        if (editable) {
            if (selectedStar) {
                position = 0;
            } else {
                position = 6;
            }
        } else {
            if (selectedStar) {
                position = -1;
            } else {
                position = 2;
            }
        }
        return position;
    };

    const getStarWidth = (starItem) => {
        let width = 0;
        let selectedStar = rating >= starItem;

        if (editable) {
            if (selectedStar) {
                width = 42;
            } else {
                width = 32;
            }
        } else {
            if (selectedStar) {
                width = 22;
            } else {
                width = 16;
            }
        }
        return width;
    };

    return <>
        {Array.from({length: 5}, (_, i) => i + 1).map(x => {
            return <div className='star-box' onClick={() => onClick ? onClick(x) : {}}>
                        <img src="/icons/star.svg" />
                        <style jsx>{`
                            .star-box {
                                border: 0.5px solid ${colors.bluePrimary};
                                box-sizing: border-box;
                                border-radius: 4px;
                                margin-right: 3px;
                                position: relative;
                                width: ${editable ? '44' : '22'}px;
                                height: ${editable ? '44' : '22'}px;
                                background-color: ${rating > 0 && rating >= x ? `${colors.bluePrimary}` : `white`};
                                cursor: ${editable ? 'pointer' : 'initial'};
                            }
                            .star-box img {
                                position: absolute;
                                top: ${getStarTopPosition(x)}px;
                                left: ${getStarLeftPosition(x)}px;
                                width: ${getStarWidth(x)}px;
                            }
                        `}</style>
                    </div>
        })}
    </>
};

export default StarRating;
