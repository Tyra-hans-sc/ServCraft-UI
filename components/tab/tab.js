
function Tab({id, text, width, onClick, isActive = false, isLast = false}) {

    return (
        <>
            <div className='tab-container' onClick={() => onClick(id)}>
                <div className='text'>
                    {text}
                    {isActive ? 
                        <div className='underline'>
                        </div> 
                    : ''}
                </div>
            </div>            

            <style jsx>{`
                .tab-container {
                    position: relative;
                    width: ${width ? width : 100}px;
                    height: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;                    
                    cursor: pointer;
                    border-right: ${!isLast ? '1px solid white' : 'none'};
                }
                .text {
                    color: white;
                    cursor: pointer;
                    padding: 0 1rem;
                    font-weight: ${isActive ? 'bold' : 'normal'};                    
                }
                .text:hover {
                    font-weight: bold;
                }
                .underline {
                    position: absolute;
                    width: 19px;
                    border: white 1px solid;
                    font-weight: bold;
                }
                .vertical-pipe {
                    display: flex;                    
                    width: 1px;
                    height: 24px;
                    border-right: 1px solid white;
                    position: absolute;
                }
            `}</style>
        </>
    )
}

export default Tab;
