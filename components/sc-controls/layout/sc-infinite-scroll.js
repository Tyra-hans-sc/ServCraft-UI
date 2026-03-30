import { useCallback, useEffect, useRef, useState } from "react";

export default function SCInfiniteScroll({ children, onInfiniteScroll, allowInfiniteScroll = true }) {

    const ref = useRef();
    const childRef = useRef();
    const [height, setHeight] = useState("0");
    const infiniteWindow = 20;
    const prevDiff = useRef(infiniteWindow + 1);

    useEffect(() => {
        updateHeight();
        window.addEventListener("resize", updateHeight);
        ref.current && ref.current.addEventListener("scroll", onScroll);

        return () => {
            window.removeEventListener("resize", updateHeight);
            ref.current && ref.current.removeEventListener("scroll", onScroll);
        };
    }, []);


    const tryTriggerInfiniteScroll = () => {
        allowInfiniteScroll && onInfiniteScroll && onInfiniteScroll();
    };

    const onScroll = useCallback((e) => {

        let rect = childRef.current.getBoundingClientRect();
        let parentRect = ref.current.getBoundingClientRect();
        let bottom = rect.y + rect.height;
        let diff = bottom - parentRect.height;

        let compareWindow = infiniteWindow + parentRect.y;
        
        if (Math.abs(diff) <= compareWindow && prevDiff.current > compareWindow) {
            tryTriggerInfiniteScroll();
        }
        prevDiff.current = diff;

    }, [ref.current, childRef.current]);

    const updateHeight = useCallback(() => {
        if (ref && ref.current) {
            let y = parseInt(ref.current.getBoundingClientRect().y.toString());
            y += 16;
            setHeight(`calc(100vh - ${y}px)`);
        }
    });

    useEffect(() => {
        updateHeight();
    }, [ref.current]);

    return (<>

        <div ref={ref} className="infinite-scroll-container">
            <div ref={childRef}>
                {children}

                {allowInfiniteScroll ?
                    <div className="infinite-scroll-button" onClick={tryTriggerInfiniteScroll}>
                        Load more
                    </div>
                    : <></>}

            </div>
        </div>

        <style jsx>{`
        
        .infinite-scroll-container {
            overflow-x: hidden;
            overflow-y: auto;
            height: ${height};
        }

        .infinite-scroll-button {
            margin: 0.5rem;
            cursor: pointer;
            font-weight: bold;
        }

        .infinite-scroll-button:hover {
            text-decoration: underline;
        }


        
        `}</style>
    </>);
};