import { redirect } from 'next/navigation'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { DocumentsAdminClient } from './edit/DocumentsAdminClient'

export default async function DocumentsAdminPage() {
  const admin = await verifyAdmin()
  if (!admin) redirect('/login')

  const { document } = await createRepositories()
  const documents = await document.findAll()

  return <DocumentsAdminClient initialDocuments={documents} />
}
