import fs from 'fs'
import matter from 'gray-matter'

function getExcerpt(str: string): string {
  if (str.length <= 300) {
    return str
  }

  const substring = str.substring(0, 300)
  const lastSpaceIndex = substring.lastIndexOf(' ')
  if (lastSpaceIndex !== -1) {
    return substring.substring(0, lastSpaceIndex)
  }
  return substring
}

export default function getPostMetadata(basePath: string) {
  const folder = basePath + '/'
  const files = fs.readdirSync(folder)
  const markdownPosts = files.filter((file) => file.endsWith('.md'))

  // get the file data
  const posts = markdownPosts.map((filename) => {
    const fileContents = fs.readFileSync(`${basePath}/${filename}`, 'utf8')
    const matterResult = matter(fileContents)
    return {
      title: matterResult.data.title,
      publishDate: matterResult.data.publishDate,
      category: matterResult.data.category,
      slug: filename.replace('.md', ''),
      body: matterResult.content,
      excerpt: getExcerpt(matterResult.content),
    }
  })
  return posts
}
