import React from 'react';
import { useFetchUserQuery } from '../../apiSlice';
import styles from './UserProfile.module.scss';

const UserProfile: React.FC = () => {
  const { data, error, isLoading } = useFetchUserQuery(1); // 예시로 1번 사용자 ID를 사용

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.toString()}</p>;

  return (
    <div className={styles.userProfile}>
      {data ? (
        <>
          <h1>{data.name}</h1>
          <p>Email: {data.email}</p>
          <img src={data.avatarUrl} alt="User Avatar" />
        </>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
};

export default UserProfile;