import { getClassmates, computeStats } from "@/lib/google-sheets"
import { PortalClient } from "@/components/portal-client"

export const revalidate = 60

export default async function Page() {
  const classmates = await getClassmates()
  const stats = computeStats(classmates)

  return <PortalClient classmates={classmates} stats={stats} />
}
