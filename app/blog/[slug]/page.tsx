import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Eye, User, Calendar, Tag } from 'lucide-react'
import LikeButton from '@/components/blog/LikeButton'
import CommentSection from '@/components/blog/CommentSection'
import PostList from '@/components/blog/PostList'

interface PostPageProps {
  params: { slug: string }
}

async function getPost(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blog/posts/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.success ? data.post : null
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    return null
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post não encontrado - Bebaby App',
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.tags?.join(', '),
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      images: post.featuredImage ? [post.featuredImage] : [],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name || post.author.username],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {post.featuredImage && (
        <div className="relative h-96 md:h-[500px] w-full">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            {/* Categories */}
                         {post.categories.length > 0 && (
               <div className="flex gap-2 mb-4">
                 {post.categories.map((category: any) => (
                   <span
                     key={category.id}
                     className="px-3 py-1 text-sm font-medium rounded-full"
                     style={{ backgroundColor: category.color + '20', color: category.color }}
                   >
                     {category.name}
                   </span>
                 ))}
               </div>
             )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-gray-600 mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              {/* Author */}
              <div className="flex items-center gap-2">
                {post.author.photoURL ? (
                  <Image
                    src={post.author.photoURL}
                    alt={post.author.name || post.author.username}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="font-medium text-gray-700">
                  {post.author.name || post.author.username}
                </span>
              </div>

              {/* Published Date */}
              {post.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              )}

              {/* Read Time */}
              {post.readTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min de leitura</span>
                </div>
              )}

              {/* Views */}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{post.viewsCount} visualizações</span>
              </div>
            </div>

            {/* Tags */}
                         {post.tags.length > 0 && (
               <div className="flex items-center gap-2 mb-6">
                 <Tag className="w-4 h-4 text-gray-400" />
                 <div className="flex flex-wrap gap-2">
                   {post.tags.map((tag: string, index: number) => (
                     <span
                       key={index}
                       className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                     >
                       #{tag}
                     </span>
                   ))}
                 </div>
               </div>
             )}

            {/* Like Button */}
            <div className="flex justify-center">
              <LikeButton
                postId={post.id}
                initialLikesCount={post.likesCount}
                initialLiked={post.userLiked}
                size="lg"
                showCount={true}
              />
            </div>
          </div>

          {/* Post Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div 
              className="prose prose-lg max-w-none prose-pink"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <CommentSection
              postId={post.id}
              initialComments={post.comments}
            />
          </div>

          {/* Related Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Posts Relacionados
            </h2>
            <PostList
              layout="grid"
              showFilters={false}
              showSearch={false}
              showPagination={false}
              limit={3}
              categoryId={post.categories[0]?.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 