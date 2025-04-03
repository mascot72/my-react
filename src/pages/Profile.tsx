import { useParams } from 'react-router-dom'

interface ProfileData {
  [username: string]: {
    name: string
    message: string
  }
}

const data: ProfileData = {
  chanwoong1: {
    name: '찬웅',
    message: '안녕하세요',
  },
  abcd: {
    name: 'alphabet',
    message: 'dfed',
  },
}

function Profile() {
  const { username } = useParams<{ username: string }>()
  let profile = null
  if (typeof username !== 'undefined') {
    profile = data[username]
  }

  return (
    <div>
      <h1>User Profile</h1>
      {(profile && (
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.message}</p>
        </div>
      )) || <p>존재하지 않는 프로필입니다.</p>}
    </div>
  )
}

export default Profile
