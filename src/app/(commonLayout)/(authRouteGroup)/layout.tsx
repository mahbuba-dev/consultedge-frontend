export default function AuthRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto w-full max-w-360">{children}</div>;
}
