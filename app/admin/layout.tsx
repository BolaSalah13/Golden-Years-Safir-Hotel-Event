/**
 * /admin route group layout.
 * The optional passcode gate lives client-side in `AdminGate`
 * (see NEXT_PUBLIC_ADMIN_CODE). If you need hard security, replace this with
 * Firebase Auth + custom claims and enforce it in `firestore.rules`.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
