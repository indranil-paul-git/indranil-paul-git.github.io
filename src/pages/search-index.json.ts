import { getCollection } from 'astro:content';

export async function GET() {
  const articles = await getCollection('wiki');
  
  const index = articles.map(article => {
    // Strip common markdown characters to reduce final search index payload size
    const cleanBody = article.body
      ? article.body
          .replace(/[#*`_\[\]()\-+\r\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      : '';

    return {
      slug: `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${article.id}`,
      title: article.data.title || '',
      description: article.data.description || '',
      tags: article.data.tags || [],
      content: cleanBody
    };
  });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
