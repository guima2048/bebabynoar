'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUsers, setTargetUsers] = useState<'all' | 'premium' | 'sugar-babies' | 'sugar-daddies'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/push-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          targetUsers,
          premiumOnly: targetUsers === 'premium',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Notificação enviada para ${data.sentCount} usuários`);
        setTitle('');
        setMessage('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao enviar notificação');
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enviar Notificações</h1>
              <p className="mt-2 text-gray-600">Envie notificações push e por email para os usuários</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
              aria-label="Voltar"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título da Notificação *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nova funcionalidade disponível!"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-600 text-gray-900 placeholder:text-gray-700"
                maxLength={100}
                required
                aria-label="Título da notificação"
              />
              <p className="mt-1 text-sm text-gray-500">{title.length}/100 caracteres</p>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite a mensagem da notificação..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-600 text-gray-900 placeholder:text-gray-700"
                maxLength={500}
                required
                aria-label="Mensagem da notificação"
              />
              <p className="mt-1 text-sm text-gray-500">{message.length}/500 caracteres</p>
            </div>

            <div>
              <label htmlFor="targetUsers" className="block text-sm font-medium text-gray-700 mb-2">
                Público-alvo
              </label>
              <select
                id="targetUsers"
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-600 text-gray-900 placeholder:text-gray-700"
                aria-label="Público-alvo"
              >
                <option value="all">Todos os usuários</option>
                <option value="premium">Apenas usuários Premium</option>
                <option value="sugar-babies">Apenas Sugar Babies</option>
                <option value="sugar-daddies">Apenas Sugar Daddies</option>
              </select>
            </div>

            {/* Preview */}
            {title || message ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview da Notificação:</h3>
                <div className="bg-white rounded border p-3">
                  <h4 className="font-semibold text-gray-900">{title || 'Título da notificação'}</h4>
                  <p className="text-gray-600 mt-1">{message || 'Mensagem da notificação'}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Enviado para: {
                      targetUsers === 'all' ? 'Todos os usuários' :
                      targetUsers === 'premium' ? 'Usuários Premium' :
                      targetUsers === 'sugar-babies' ? 'Sugar Babies' :
                      'Sugar Daddies'
                    }
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                A notificação será enviada por push e email
              </div>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !message.trim()}
                className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                aria-label="Enviar notificação"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar Notificação'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas para notificações eficazes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Mantenha o título curto e chamativo (máximo 100 caracteres)</li>
            <li>• Use a mensagem para fornecer mais detalhes</li>
            <li>• Seja específico sobre o público-alvo para maior relevância</li>
            <li>• Evite enviar muitas notificações para não incomodar os usuários</li>
            <li>• Teste com um grupo pequeno antes de enviar para todos</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 