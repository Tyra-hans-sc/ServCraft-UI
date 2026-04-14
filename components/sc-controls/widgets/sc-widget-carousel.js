import { colors } from '../../../theme';
import Button from '../../button';
import SCCarousel from '../layout/sc-carousel';
import SCWidgetCard from '../layout/sc-widget-card';
import Helper from '../../../utils/helper';
import { useRouter } from 'next/router';
import constants from '../../../utils/constants';

export default function SCWidgetCarousel({ onDismiss = null, widget }) {

    const router = useRouter();

    const cardClick = (cardName, url) => {
        Helper.mixpanelTrack(constants.mixPanelEvents.slideshowCardClicked, {
            url: url,
            cardName: cardName
        })
        Helper.nextRouter(router.push, url);
    };

    const cardCreateAJob = () => {
        return (<>
            <div className="card-container">

                <h2>Make sure nothing falls through the cracks</h2>
                <p>Experience the power of job cards - with none of the paper.</p>
                <p>Create a job, manage your teams, and communicate with customers all in one place.</p>

                <Button text="Create a Job" extraClasses="white fit-content" onClick={() => cardClick("create a job", "/job/create")}/>

                <img src="/carousel-job.png" style={{float: "right", height: "10rem", position: "absolute", bottom: "2rem", right: "0.5rem"}}/>
            </div>
            <style jsx>{`
                .card-container {
                    font-size: 0.8rem;
                    color: white;
                    position: absolute;
                    inset: 0;
                    background-color: ${colors.bluePrimary};
                    padding: 1rem 1rem;
                    ${widget.RowHeight ? `height: ${widget.RowHeight};` : ""}
                }
            `}</style>

        </>);
    };

    const cardCreateAQuote = () => {
        return (<>
            <div className="card-container">
                <h2>Win more jobs. Get paid faster</h2>
                <p>ServCraft makes it simple for customers to approve and pay quotes and invoices.</p>
                <p>Create quotes and invoices directly from ServCraft. Customers can approve and pay instantly. Balance the books with our accounting software integration.</p>
                <Button text="Create a Quote" extraClasses="white fit-content" onClick={() => cardClick("create a quote", "/quote/create")}/>
                <img src="/carousel-quote.png" style={{float: "right", height: "7rem", position: "absolute", bottom: "2rem", right: 0}}/>
            </div>
            <style jsx>{`
                .card-container {
                    font-size: 0.8rem;
                    color: white;
                    position: absolute;
                    inset: 0;
                    background-color: ${colors.bluePrimary};
                    padding: 1rem 1rem;
                    ${widget.RowHeight ? `height: ${widget.RowHeight};` : ""}
                }
            `}</style>

        </>);
    };

    const cardCreateAnIntegration = () => {
        return (<>
            <div className="card-container">
                <h2>Fastrack your finances</h2>
                <p>Integration with your accounting package.</p>
                <p>ServCraft + your accounting software = even more control and productivity with less time. ServCraft integrates seamlessly with Xero, Sage, and Quickbooks so you can capture quotes, invoices, purchase orders, and payments in one place.</p>
                <Button text="Integrate Now" extraClasses="white fit-content" onClick={() => cardClick("create an integration", "/settings/integration/manage")}/>
                <img src="/carousel-finances.png" style={{float: "right", height: "8rem", position: "absolute", bottom: "2rem", right: 0}}/>
            </div>
            <style jsx>{`
                .card-container {
                    font-size: 0.8rem;
                    color: white;
                    position: absolute;
                    inset: 0;
                    background-color: ${colors.bluePrimary};
                    padding: 1rem 1rem;
                    ${widget.RowHeight ? `height: ${widget.RowHeight};` : ""}
                }
            `}</style>

        </>);
    };

    return (<>

        <SCWidgetCard onDismiss={onDismiss}>
            <SCCarousel autoPlay={true}>
                {cardCreateAJob()}
                {cardCreateAQuote()}
                {cardCreateAnIntegration()}
            </SCCarousel>
        </SCWidgetCard>

        <style jsx>{`
        
        `}</style>

    </>);
}