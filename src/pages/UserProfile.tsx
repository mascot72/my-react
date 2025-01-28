// src/pages/UserProfile.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../app/store';
import { fetchUser } from '../features/user/api';
import { RootState } from '../app/store';
const UserProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // dispatch는 자동으로 AppDispatch 타입을 추론합니다.
  // const dispatch = useDispatch(); // dispatch는 자동으로 AppDispatch 타입을 추론합니다.
  const { data, loading, error } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const userId = 1; // 예시로 1번 사용자 ID를 사용
    dispatch(fetchUser(userId)); // 이제 오류 없이 실행됩니다.
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>Email: {data.email}</p>
      <img src={data.avatarUrl} alt="User Avatar" />
    </div>
  );
};

export default UserProfile;
