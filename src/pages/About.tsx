import React from 'react'
import { useLocation, useSearchParams } from 'react-router'

const About: React.FC = () => {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const detail = searchParams.get('detail')
  const page = parseInt(searchParams.get('page') || '0')

  function onToggleDetail() {
    setSearchParams((prev) => ({
      ...prev,
      detail: detail === 'true' ? 'false' : 'true',
      page,
    }))
  }

  function onIncreasePage() {
    // set 메서드를 통해 특정 쿼리파라미터를 업데이트할 수 있다
    setSearchParams((prev) => ({ ...prev, detail, page: page + 1 }))
  }

  return (
    <div>
      <h1>About Page</h1>
      <p>리엑트 라우터를 사용해 보는 프로젝트입니다.</p>
      <p>쿼리스트링: {location.search}</p>
      <p>detail: {detail}</p>
      <p>page: {page}</p>
      <button onClick={onToggleDetail}>Toggle Detail</button>
      <button onClick={onIncreasePage}>Increase Page</button>
    </div>
  )
}

export default About
