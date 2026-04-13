
import ReviewModal from "@/components/modules/Review/ReviewModal";

export default function giveReview() {
  return (
   
     <ReviewModal open={false} onSubmit={function (rating: number, comment: string, consultationId: string): void {
          throw new Error("Function not implemented.");
      } } onClose={function (): void {
          throw new Error("Function not implemented.");
      } } consultationId={""}/>
  
  );
}
