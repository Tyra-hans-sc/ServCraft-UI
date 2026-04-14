import React from 'react';

const TSTestComp = (props) => {
    return (<div>
        {props.a}: {props.b}
    </div>);
};

export default TSTestComp;



// type TestProps = {
//     a: string,
//     b: number
// };

// const TSTestComp: React.FC<TestProps> = (props: TestProps) => {
//     return (<div>
//         {props.a}: {props.b}
//     </div>);
// };

// export default TSTestComp;