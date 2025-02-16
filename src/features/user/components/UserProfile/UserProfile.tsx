import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../api';
import { RootState, AppDispatch } from '../../../../app/store';
import styles from './UserProfile.module.scss';

const UserProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const userId = 1; // 예시로 1번 사용자 ID를 사용
    dispatch(fetchUser(userId));
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.userProfile}>
      <h1>{data.name}</h1>
      <p>Email: {data.email}</p>
      <img src={data.avatarUrl} alt="User Avatar" />
    </div>
  );
};

export default UserProfile;