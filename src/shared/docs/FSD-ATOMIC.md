<!-- # sass/scss CSS-in-?에 [진행중] -->

# FSD, ATOMIC Design Pattern 폴더 구조

이 프로젝트는 FSD(Feature-Sliced Design)와 ATOMIC Design Pattern의 장점을 결합한 폴더 구조를 사용합니다.

## + TDD에서의 폴더 구조 설계

기본적으로는 애플리케이션 코드와 테스트 코드를 동일한 레벨에서 관리하며, 각 테스트 파일을 컴포넌트나 기능별로 분리하는 방식이 유용합니다.

## 폴더 구조

```bash
src/
│
├── components/                  # UI 컴포넌트 (Atomic Design)
│   ├── atoms/                   # 기본 UI 요소 (버튼, 입력 필드 등)
│   │   ├── Button.tsx            # Button 컴포넌트
│   │   └── Button.test.ts        # Button 컴포넌트에 대한 테스트
│   ├── molecules/               # 결합된 컴포넌트 (입력 폼, 카드 등)
│   ├── organisms/               # 복합적인 UI 컴포넌트 (네비게이션 바, 대시보드 등)
│   ├── templates/               # 페이지 레이아웃
│   └── pages/                   # 최종 페이지 구성 요소
│
├── features/                    # 기능별 모듈 (FSD)
│   ├── featureA/
│   │   ├── components/          # featureA 관련 컴포넌트
│   │   │   ├── FeatureAComponent.tsx
│   │   │   └── FeatureAComponent.test.ts # FeatureAComponent에 대한 테스트
│   │   ├── hooks/               # featureA 관련 hooks
│   │   ├── services/            # featureA 관련 서비스
│   │   └── utils/               # featureA 관련 유틸리티
│   ├── featureB/
│   │   ├── components/          # featureB 관련 컴포넌트
│   │   ├── hooks/               # featureB 관련 hooks
│   │   ├── services/            # featureB 관련 서비스
│   │   └── utils/               # featureB 관련 유틸리티
│   └── ...
│
├── shared/                      # 공통 컴포넌트 및 유틸리티
│   ├── components/              # 모든 기능에서 사용하는 공통 컴포넌트
│   ├── hooks/                   # 공통 hooks
│   ├── services/                # 공통 서비스
│   └── utils/                   # 공통 유틸리티
│
├── assets/                      # 이미지, 폰트 등
├── styles/                      # 전역 스타일 (CSS/SCSS)
├── utils/                       # 전역 유틸리티 함수들
└── app/                         # 앱의 엔트리 포인트 및 설정
    ├── routes/                  # 애플리케이션의 라우팅 설정
    ├── store/                   # 전역 상태 관리
    ├── i18n/                    # 다국어 지원 (i18n 설정)
    └── App.tsx                  # 루트 컴포넌트
```

### 주요 장점

- **모듈화**: 기능별로 폴더를 나누어 코드의 응집도를 높이고, 유지보수를 용이하게 합니다.
- **재사용성**: ATOMIC Design Pattern을 통해 작은 단위의 컴포넌트를 재사용할 수 있습니다.
- **확장성**: 새로운 기능을 추가할 때 기존 구조를 쉽게 확장할 수 있습니다.
- **명확한 책임 분리**: 각 폴더는 명확한 책임을 가지며, 코드의 가독성을 높입니다.

### 설명

1. Components: ATOMIC Design 원칙에 따라 atoms, molecules, organisms, templates, pages 폴더로 분리하여 UI 요소를 계층화합니다.

- atoms: 버튼, 입력 필드 같은 기본 UI 요소.
- molecules: 버튼과 입력 필드를 결합한 폼 같은 중간 복합 요소.
- organisms: 네비게이션 바, 대시보드와 같은 큰 컴포넌트.
- templates: 페이지 레이아웃을 담당.
- pages: 최종 페이지 레벨 컴포넌트.

2. Features: FSD의 원칙을 적용하여 기능 단위로 모듈을 나눕니다. 각 기능은 components, hooks, services, utils를 포함하여 독립적으로 관리할 수 있도록 합니다.

각 기능에 필요한 코드와 리소스들을 모듈화하여 유지보수성을 높입니다.

3. Shared: 여러 기능에서 공통적으로 사용하는 컴포넌트나 유틸리티는 shared 폴더에 배치합니다.
