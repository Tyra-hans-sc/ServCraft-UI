import CustomSchedulerItem from "./custom-scheduler-item";

export default function CustomSchedulerItemMonth(props) {
    return CustomSchedulerItem({ ...props, monthView: true });
}