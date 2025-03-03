# authentication: auth0
>> https://auth0.com/docs/quickstart/spa/react/interactive

# sass

# FSD, ATOMIC Design Pattern 폴더 구조

이 프로젝트는 FSD(Feature-Sliced Design)와 ATOMIC Design Pattern의 장점을 결합한 폴더 구조를 사용합니다. 

## 폴더 구조

src/ 
├── features/ │ ├── user/ │ │
├── components/ │ │
├── hooks/ │ │
├── services/ │ │
├── slices/ │ │ └── utils/ ├── shared/ │ ├── components/ │ ├── hooks/ │ ├── services/ │ └── utils/ └── styles/

### 주요 장점

- **모듈화**: 기능별로 폴더를 나누어 코드의 응집도를 높이고, 유지보수를 용이하게 합니다.
- **재사용성**: ATOMIC Design Pattern을 통해 작은 단위의 컴포넌트를 재사용할 수 있습니다.
- **확장성**: 새로운 기능을 추가할 때 기존 구조를 쉽게 확장할 수 있습니다.
- **명확한 책임 분리**: 각 폴더는 명확한 책임을 가지며, 코드의 가독성을 높입니다.