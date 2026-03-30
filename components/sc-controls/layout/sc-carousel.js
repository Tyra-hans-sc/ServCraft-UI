import Carousel from "react-material-ui-carousel";

export default function SCCarousel({ children, interval = 5000, animation = "slide", autoPlay = true }) {

    return (
        <>
            <Carousel animation={animation} interval={interval} autoPlay={autoPlay} className="carousel-root-SC">
                {children}
            </Carousel>

            <style jsx>{`

            :global(.carousel-root-SC) {
                height: 100% !important;
            }

            :global(.carousel-root-SC > div:last-child) {
                width: 100% !important;
                margin-top: 0px !important;
                text-align: center !important;
                position: absolute !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 24px !important;
            }

            :global(.carousel-root-SC > div:first-child > div) {
                height: 100% !important;
            }

            :global(.carousel-root-SC > div:nth-child(2) svg path), :global(.carousel-root-SC > div:nth-child(3) svg path) {
                fill: white;
            }

            `}</style>
        </>
    );
}

// slide or fade