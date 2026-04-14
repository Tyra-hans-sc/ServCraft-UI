import { DailyStat, WidgetConfig, WidgetIDConstants } from "@/PageComponents/Dashboard/DashboardModels";
import { FC, useEffect, useState } from "react";
import SCWidgetCard from "./sc-widget-card";
import { colors } from "@/theme";

const SCWidgetDailyStats: FC<{
    widget: WidgetConfig
    onDismiss: (() => {}) | undefined
}> = ({ widget, onDismiss }) => {


    const [stats, setStats] = useState<DailyStat[]>([]);

    useEffect(() => {

        let stat: DailyStat[] = [];

        switch (widget.id) {
            case WidgetIDConstants.dailyStatJob:
                stat.push({ name: "job", label: "Jobs Today", data: Math.floor(Math.random() * 50).toString(), canAdd: true, icon: "/sc-icons/jobs-blue.svg" });
                break;
            case WidgetIDConstants.dailyStatAppointment:
                stat.push({ name: "appointment", label: "Appointments Today", data: Math.floor(Math.random() * 50).toString(), canAdd: true, icon: "/sc-icons/appointments-blue.svg" });
                break;
            case WidgetIDConstants.dailyStatQuote:
                stat.push({ name: "quote", label: "Quotes to Follow Up", data: Math.floor(Math.random() * 50).toString(), canAdd: true, icon: "/sc-icons/quotes-blue.svg" });
                break;
            case WidgetIDConstants.dailyStatPayment:
                stat.push({ name: "payment", label: "Payments", data: Math.floor(Math.random() * 50).toString(), canAdd: false, icon: "/sc-icons/purchases-blue.svg" });
                break;
        }

        setStats(stat);
    }, []);

    function RenderStat({ stat }: { stat: DailyStat }) {
        return (
            <div className="stat-container" style={{ width: "100%" }}>
                <SCWidgetCard height={widget.heightPX as any}>
                    <div className="stat-content" style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "calc(100% - 2rem)", textAlign: "center", padding: "1rem 0" }}>
                        {stat.canAdd && <img className="add-button" style={{ position: "absolute", right: 4, top: 4, cursor: "pointer" }} src="/specno-icons/add.svg" />}
                        {stat.icon && <img style={{ position: "absolute", left: 4, top: 4, height: 40 }} src={stat.icon} />}
                        <div style={{ fontSize: "3rem", fontWeight: "bold", color: colors.bluePrimary }}>
                            {stat.data}
                        </div>
                        <div style={{ fontSize: "1rem" }}>{stat.label}</div>
                    </div>
                </SCWidgetCard>

                <style jsx>{`
                    
                .stat-content img.add-button {
                    display: none;
                }

                .stat-content:hover img.add-button {
                    display: block;
                }
{/* 
                .stat-container + .stat-container {
                    margin-left:16px;
                } */}

                    `}</style>
            </div>
        );
    }


    return (<>

        <div className="widget-container" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", width: "100%", justifyContent: "space-between", borderRadius: 4 }}>
            {stats.map(stat => {
                return <RenderStat stat={stat} key={stat.name} />
            })}
        </div>

        <style jsx>{`
            .widget-container {
                transition: 0.25s;
            }

            .widget-container:hover {
                {/* background: #0000000a; */}
                transition: 0.25s;
            }
        `}</style>
    </>);
};

export default SCWidgetDailyStats;

