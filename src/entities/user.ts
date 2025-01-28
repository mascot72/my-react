// src/entities/user.ts

// User 데이터 구조를 정의하는 인터페이스
export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
}

// 사용자 관련 기본 데이터 (예: 빈 사용자 객체)
export const initialUserState: User = {
  id: 0,
  name: '',
  email: '',
  avatarUrl: '',
};
