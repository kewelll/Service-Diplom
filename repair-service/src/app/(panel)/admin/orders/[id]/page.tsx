import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { loadCatalogs, loadOrderDetail } from "@/lib/orderQuery";
import OrderWorkbench from "@/components/OrderWorkbench";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const order = await loadOrderDetail(Number(id));
  if (!order) notFound();
  const { services, parts, masters } = await loadCatalogs();

  return (
    <OrderWorkbench
      order={order}
      services={services}
      parts={parts}
      masters={masters}
      isAdmin
      backHref="/admin/orders"
    />
  );
}
