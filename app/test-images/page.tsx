import ImageTest from '@/components/ImageTest'

export default function TestImagesPage() {
  // URLs de teste baseadas nas imagens que existem no diretório
  const testImages = [
    {
      title: 'Imagem do Blog 1',
      url: '/uploads/blog/blog-1752204288497-4ak1aj81ayy.jpg'
    },
    {
      title: 'Imagem do Blog 2',
      url: '/uploads/blog/blog-1752195769522-m36gbxqpcso.jpg'
    },
    {
      title: 'Imagem do Blog 3',
      url: '/uploads/blog/blog-1752176618966-zjas6jcyfj.jpg'
    },
    {
      title: 'Imagem do Blog 4',
      url: '/uploads/blog/blog-1752101480163-4lwz7jj1g3f.jpg'
    },
    {
      title: 'Imagem do Blog 5',
      url: '/uploads/blog/blog-1752099961174-oj2aazxcuj.jpg'
    },
    {
      title: 'Imagem do Blog 6',
      url: '/uploads/blog/blog-1752099953545-ostae96a1li.jpg'
    },
    {
      title: 'Imagem do Blog 7',
      url: '/uploads/blog/blog-1752093955644-l5dqfyfdagi.jpg'
    },
    {
      title: 'Imagem do Blog 8',
      url: '/uploads/blog/blog-1752093910984-mg6eceimwbs.jpg'
    },
    {
      title: 'Imagem do Blog 9',
      url: '/uploads/blog/blog-1752093903558-iojy4hjquua.jpg'
    },
    {
      title: 'Imagem do Blog 10',
      url: '/uploads/blog/blog-1752091941622-uetwvku2vx.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Teste de Carregamento de Imagens
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testImages.map((image, index) => (
            <ImageTest
              key={index}
              title={image.title}
              imageUrl={image.url}
            />
          ))}
        </div>
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Instruções</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Abra o console do navegador (F12) para ver os logs de debug</li>
            <li>• Verifique se as imagens estão carregando corretamente</li>
            <li>• Observe os status de cada imagem (carregando, sucesso, erro)</li>
            <li>• Se houver erros, verifique as URLs no console</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 