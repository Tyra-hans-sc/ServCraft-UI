import CustomSchedulerSlot from "./custom-scheduler-slot";

export default function CustomSchedulerSlotMonth(props) {
    return CustomSchedulerSlot({ ...props, monthView: true });
}