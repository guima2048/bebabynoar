import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar reports (apenas para admins)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Buscar reports
    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            userType: true
          }
        },
        reported: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            userType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Contar total de reports
    const total = await prisma.report.count({ where });

    return NextResponse.json({
      reports: reports.map(report => ({
        id: report.id,
        reason: report.reason,
        description: report.description,
        status: report.status,
        reporter: report.reporter,
        reportedUser: report.reported,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar reports:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar um novo report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { targetUserId, reason, description } = await request.json();

    if (!targetUserId || !reason) {
      return NextResponse.json(
        { error: 'ID do usuário e motivo são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário alvo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se não está tentando reportar a si mesmo
    if (session.user.id === targetUserId) {
      return NextResponse.json(
        { error: 'Não é possível reportar a si mesmo' },
        { status: 400 }
      );
    }

    // Verificar se já existe um report pendente do mesmo usuário
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        reportedId: targetUserId,
        status: 'PENDING'
      }
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'Você já reportou este usuário e o caso está sendo investigado' },
        { status: 400 }
      );
    }

    // Criar o report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedId: targetUserId,
        reason: reason,
        description: description || '',
        status: 'PENDING'
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            username: true,
            userType: true
          }
        },
        reported: {
          select: {
            id: true,
            name: true,
            username: true,
            userType: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        reason: report.reason,
        description: report.description,
        status: report.status,
        reporter: report.reporter,
        reported: report.reported,
        createdAt: report.createdAt
      },
      message: 'Report enviado com sucesso. Nossa equipe irá analisar o caso.'
    });
  } catch (error) {
    console.error('Erro ao criar report:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 