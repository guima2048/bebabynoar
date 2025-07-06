export async function POST() {
  return Response.json({ error: 'Endpoint desativado. Firebase removido.' }, { status: 410 })
} 