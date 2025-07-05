import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('🚀 Iniciando upload de imagem...')
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📁 Arquivo recebido:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      exists: !!file
    })
    
    if (!file) {
      console.error('❌ Nenhum arquivo foi enviado')
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    console.log('🔍 Validando tipo de arquivo:', file.type)
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Tipo de arquivo não suportado:', file.type)
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    console.log('📏 Tamanho do arquivo:', file.size, 'bytes (máximo:', maxSize, 'bytes)')
    if (file.size > maxSize) {
      console.error('❌ Arquivo muito grande:', file.size, 'bytes')
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      );
    }

    console.log('🔍 Obtendo bucket do Storage...')
    const bucket = getAdminStorage();
    console.log('✅ Bucket obtido:', bucket.name)
    
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `landing/${timestamp}_${file.name}`;
    console.log('📝 Nome do arquivo:', fileName)

    // Converter File para Buffer
    console.log('🔄 Convertendo arquivo para Buffer...')
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    console.log('✅ Arquivo convertido, tamanho do buffer:', fileBuffer.length, 'bytes')

    // Criar arquivo no bucket
    console.log('📤 Fazendo upload para o bucket...')
    const fileUpload = bucket.file(fileName);
    
    console.log('💾 Salvando arquivo...')
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });
    console.log('✅ Arquivo salvo com sucesso!')

    // Tornar o arquivo público
    console.log('🌐 Tornando arquivo público...')
    await fileUpload.makePublic();
    console.log('✅ Arquivo tornado público!')

    // Obter URL pública
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
    console.log('🔗 URL gerada:', downloadURL)

    console.log('🎉 Upload concluído com sucesso!')
    return NextResponse.json({
      success: true,
      url: downloadURL,
      fileName: fileName
    });

  } catch (error: any) {
    console.error('💥 Erro detalhado no upload da imagem:')
    console.error('   Tipo do erro:', error?.constructor?.name || 'Unknown')
    console.error('   Mensagem:', error?.message || 'Erro desconhecido')
    console.error('   Stack:', error?.stack || 'Sem stack trace')
    
    if (error?.code) {
      console.error('   Código do erro:', error.code)
    }
    if (error?.status_) {
      console.error('   Status:', error.status_)
    }
    if (error?.customData) {
      console.error('   Dados customizados:', error.customData)
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error?.message || 'Erro desconhecido',
        code: error?.code || 'unknown'
      },
      { status: 500 }
    );
  }
} 