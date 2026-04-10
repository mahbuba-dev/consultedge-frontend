import MyBookingsList from "@/components/modules/Bokings/MyBookingsList";

export default function BookingsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My bookings</h1>
        <p className="text-muted-foreground">
          Review your expert consultations, payment progress, and upcoming session details.
        </p>
      </div>

      <MyBookingsList />
    </div>
  );
}