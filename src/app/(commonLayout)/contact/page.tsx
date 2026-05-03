import ContactPage from "@/components/modules/Contact/ContactPage";

export const metadata = {
  title: "Contact Us | ConsultEdge",
  description:
    "Get in touch with the ConsultEdge team. Reach us by email, phone, or send a message directly through our contact form.",
};

export default function ContactRoute() {
  return (
    <div className="mx-auto w-full max-w-360 px-4 md:px-6">
      <ContactPage />
    </div>
  );
}
