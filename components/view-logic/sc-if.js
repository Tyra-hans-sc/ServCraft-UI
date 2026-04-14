export function IF({ condition = undefined, children }) {
    const getChildren = () => {
        if (children) {
            if (Array.isArray(children)) {
                return children;
            } else {
                return [children];
            }
        } else {
            return [];
        }
    };

    const getChild = (selector) => {
        var child = getChildren().find(x => typeof x.type === "function" && x.type.name === selector);
        if (child) {
            return child;
        }
        return <></>;
    };

    const getThen = () => {
        return getChild("THEN");
    };

    const getElse = () => {
        return getChild("ELSE");
    };

    const renderCondition = () => {
        if (condition === undefined) {
            return <></>;
        }

        if (condition) {
            return getThen();
        } else {
            let matchingChild = null;
            getChildren().filter(child => typeof child.type === "function" && child.type.name === "ELSEIF").forEach((child) => {
                if (child.props.condition && !matchingChild) {
                    matchingChild = child;
                }
            });
            if (matchingChild) {
                return matchingChild;
            } else {
                return getElse();
            }
        }
    };

    return (<>
        {renderCondition()}
    </>);
};

export function THEN({ children }) {
    // logic is handled in the IF parent
    return children ? children : () => <></>;
};

export function ELSE({ children }) {
    // logic is handled in the IF parent
    return children ? children : () => <></>;
};

export function ELSEIF({ condition = false, children }) {
    // logic is handled in the IF parent
    return children ? children : () => <></>;
};

