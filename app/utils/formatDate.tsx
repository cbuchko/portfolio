export default function formatDate(date: string) {
  const yourDate = new Date(date)
  return yourDate.toISOString().split('T')[0]
}
