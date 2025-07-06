export async function GET() {
  // Dados mockados para a landing page
  const mockData = {
    bannerTitle: "A Maior Rede Sugar do Brasil",
    bannerSubtitle: "Mulheres Lindas, Homens Ricos",
    bannerDescription: "Encontre sua conexão perfeita no Bebaby App. A plataforma mais confiável e segura para Sugar Babies e Sugar Daddies encontrarem relacionamentos genuínos.",
    primaryButtonText: "Cadastre-se Grátis",
    primaryButtonLink: "/register",
    secondaryButtonText: "Explorar Perfis",
    secondaryButtonLink: "/explore",
    heroBaby1Image: "/landing/baby-1.png",
    heroDaddy1Image: "/landing/padraohomem.webp",
    heroBaby2Image: "/landing/padraomulher.webp",
    heroDaddy2Image: "/landing/padraohomem.webp",
    testimonials: [
      {
        id: "1",
        name: "Ana Silva",
        location: "São Paulo",
        story: "O Bebaby mudou minha vida! Conheci pessoas incríveis e me sinto segura na plataforma. Recomendo para todas as mulheres que buscam algo especial.",
        rating: 5,
        photo: "/landing/padraomulher.webp",
        isActive: true
      },
      {
        id: "2",
        name: "Carlos Mendes",
        location: "Rio de Janeiro",
        story: "Encontrei uma parceira maravilhosa e recomendo para todos que buscam algo verdadeiro. A plataforma é muito profissional e segura.",
        rating: 5,
        photo: "/landing/padraohomem.webp",
        isActive: true
      },
      {
        id: "3",
        name: "Mariana Costa",
        location: "Belo Horizonte",
        story: "Sou muito feliz com os relacionamentos que construí através do Bebaby. A qualidade dos perfis é excepcional e o suporte é incrível.",
        rating: 5,
        photo: "/landing/padraomulher.webp",
        isActive: true
      },
      {
        id: "4",
        name: "Roberto Santos",
        location: "Brasília",
        story: "Como empresário, valorizo muito a discrição e qualidade. O Bebaby oferece exatamente isso. Encontrei uma companheira perfeita.",
        rating: 5,
        photo: "/landing/padraohomem.webp",
        isActive: true
      }
    ],
    sugarBabies: [
      {
        id: "sb1",
        name: "Maria Clara",
        location: "São Paulo",
        profession: "Estudante",
        photo: "/landing/padraomulher.webp",
        isActive: true
      },
      {
        id: "sb2",
        name: "Isabella",
        location: "Rio de Janeiro",
        profession: "Modelo",
        photo: "/landing/padraomulher.webp",
        isActive: true
      },
      {
        id: "sb3",
        name: "Sofia",
        location: "Belo Horizonte",
        profession: "Designer",
        photo: "/landing/padraomulher.webp",
        isActive: true
      },
      {
        id: "sb4",
        name: "Valentina",
        location: "Brasília",
        profession: "Fotógrafa",
        photo: "/landing/padraomulher.webp",
        isActive: true
      },
      {
        id: "sb5",
        name: "Gabriela",
        location: "Salvador",
        profession: "Jornalista",
        photo: "/landing/padraomulher.webp",
        isActive: true
      },
      {
        id: "sb6",
        name: "Larissa",
        location: "Recife",
        profession: "Advogada",
        photo: "/landing/padraomulher.webp",
        isActive: true
      }
    ],
    sugarDaddies: [
      {
        id: "sd1",
        name: "Roberto Silva",
        location: "São Paulo",
        profession: "Empresário",
        photo: "/landing/padraohomem.webp",
        isActive: true
      },
      {
        id: "sd2",
        name: "Carlos Mendes",
        location: "Rio de Janeiro",
        profession: "Executivo",
        photo: "/landing/padraohomem.webp",
        isActive: true
      },
      {
        id: "sd3",
        name: "Antonio Costa",
        location: "Belo Horizonte",
        profession: "Médico",
        photo: "/landing/padraohomem.webp",
        isActive: true
      },
      {
        id: "sd4",
        name: "Fernando Santos",
        location: "Brasília",
        profession: "Advogado",
        photo: "/landing/padraohomem.webp",
        isActive: true
      },
      {
        id: "sd5",
        name: "Marcelo Lima",
        location: "Salvador",
        profession: "Engenheiro",
        photo: "/landing/padraohomem.webp",
        isActive: true
      },
      {
        id: "sd6",
        name: "Ricardo Alves",
        location: "Recife",
        profession: "Arquiteto",
        photo: "/landing/padraohomem.webp",
        isActive: true
      }
    ]
  };

  return Response.json(mockData);
}

export async function POST() {
  return Response.json({ error: 'Endpoint desativado. Firebase removido.' }, { status: 410 })
} 