import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { loadCatalogs, loadOrderDetail } from "@/lib/orderQuery";
import OrderWorkbench from "@/components/OrderWorkbench";

export default async function MasterOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("MASTER");
  const { id } = await params;
  const order = await loadOrderDetail(Number(id));
  if (!order || order.masterId !== user.id) notFound();
  const { services, parts, masters } = await loadCatalogs();

  return (
    <OrderWorkbench
      order={order}
      services={services}
      parts={parts}
      masters={masters}
      isAdmin={false}
      backHref="/master"
    />
  );
}
