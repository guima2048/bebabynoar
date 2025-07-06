export async function GET() {
  return Response.json({ error: 'Endpoint desativado. Firebase removido.' }, { status: 410 })
} 