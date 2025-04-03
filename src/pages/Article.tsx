import { useParams } from 'react-router-dom'

export default function Article() {
  const { id } = useParams()
  return (
    <div>
      <h2>게시글 {id} Detail Page</h2>
    </div>
  )
}
