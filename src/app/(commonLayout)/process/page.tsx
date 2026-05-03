import HowItWorksPage from "@/components/modules/HowItWorks/HowItWorksPage";

export const metadata = {
  title: "How It Works | ConsultEdge",
  description:
    "Learn how ConsultEdge connects you with verified expert consultants in four simple steps — browse, book, meet, and act.",
};

export default function HowItWorksRoute() {
  return (
    <div className="mx-auto w-full max-w-360 px-4 md:px-6">
      <HowItWorksPage />
    </div>
  );
}