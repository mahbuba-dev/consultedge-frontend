import MyScheduleList from "@/components/modules/Experts/MyScheduleList";

export default function ExpertMySchedulesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My schedules</h1>
        <p className="text-muted-foreground">
          Review every availability slot you have assigned, refresh the list, and remove any slot you
          no longer want to offer.
        </p>
      </div>

      <MyScheduleList />
    </div>
  );
}
