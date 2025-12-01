# Vitest를 사용하여 TDD 구현을 위한 폴더 및 테스트 파일 위치

**Vitest**를 사용하여 **TDD(Test-Driven Development)** 방식을 구현할 때, 폴더 구조와 테스트 파일 위치는 테스트와 코드의 관계를 명확히 하고, 유지보수성을 높이는 데 중요합니다. 일반적으로 TDD를 사용할 때는 테스트 파일을 **애플리케이션 코드와 함께** 관리하는 것이 좋습니다. 이를 통해 테스트와 구현 코드를 가까이 두어 서로 의존성을 쉽게 추적하고 테스트를 자주 실행할 수 있습니다.

## TDD에서의 폴더 구조 설계

기본적으로는 **애플리케이션 코드**와 **테스트 코드**를 동일한 레벨에서 관리하며, 각 테스트 파일을 **컴포넌트나 기능별**로 분리하는 방식이 유용합니다. Vitest와 함께 사용할 수 있는 적절한 폴더 구조

## 테스트 파일 위치와 규칙

1. Component.test.ts 형식:

- 테스트 파일은 항상 컴포넌트나 기능 파일과 같은 폴더에 위치시키는 것이 좋습니다.
- 예를 들어, Button.tsx 컴포넌트가 있다면 Button.test.ts와 같은 형식으로 테스트 파일을 작성합니다.
- 이는 테스트가 해당 파일에 대해서만 영향을 미치도록 보장하고, 코드를 쉽게 추적할 수 있게 합니다.

2. 기능별 테스트:

- features/ 폴더 안에서도 기능에 대한 테스트 파일을 같은 구조로 배치합니다. 예를 들어, featureA에 해당하는 기능이 있다면, 그에 대한 테스트는 featureA 폴더 안에 FeatureAComponent.test.ts와 같은 형태로 관리합니다.

3. 공통 코드의 테스트:

- 공통 컴포넌트나 서비스 등은 shared/ 폴더 아래에 두고, 해당 컴포넌트의 테스트 파일은 shared/components/Button.test.ts 같은 형식으로 관리합니다.

4. 테스트 파일 형식:

- 테스트 파일은 .test.ts 또는 .spec.ts 확장자를 사용하여 구분합니다. 일반적으로 .test.ts가 널리 사용됩니다.

5. 비즈니스 로직, 서비스, 유틸리티 등:

- 비즈니스 로직(예: 서비스, 유틸리티 함수 등)은 테스트가 필요한 경우 해당 파일 옆에 테스트 파일을 배치합니다. 예를 들어, utils/ 폴더 안의 helper.ts라는 유틸리티 함수가 있다면 helper.test.ts와 같은 형식으로 테스트 파일을 작성합니다.

## Test-Driven Development (TDD)에서의 테스트 작성 흐름

TDD에서 테스트는 구현 전에 작성되어야 하므로, 테스트 파일을 먼저 작성한 후 이를 바탕으로 기능을 구현합니다. 이를 통해 요구 사항을 명확히 하고, 리팩토링 및 디버깅을 용이하게 할 수 있습니다.

1. 테스트 작성:

- 먼저 구현할 컴포넌트나 기능에 대한 테스트 파일을 작성합니다. 테스트는 명확한 입력과 출력을 정의하고, 기능이 제대로 동작하는지 확인하는 역할을 합니다.

2. 테스트 실행 및 실패 확인:

- Vitest를 사용하여 작성한 테스트를 실행합니다. 이 시점에서는 테스트가 실패할 것입니다. 이는 기대하는 동작을 구현하지 않았기 때문입니다.

3. 기능 구현:

- 테스트가 실패한 원인을 찾아 기능을 구현합니다. 이때 기능을 구현하면서 테스트를 계속 실행하여 구현이 원하는 대로 동작하는지 확인합니다.

4. 리팩토링 및 개선:

- 기능이 구현된 후, 코드가 깨끗하고 효율적인지 점검하며 리팩토링을 합니다. 이때도 기존 테스트가 통과하는지 확인하여 리팩토링 후에도 기존 기능이 잘 동작하는지 보장합니다.




Shot index (col,row)
     ↓
Shot physical origin (shotX,shotY)
dieLocalIndex: dieIndex % splitX
shotIndex * shotWidth +
 (shotLocalX: dieLocalIndex * dieWidth + dieX) + offsetX
     ↓
Shot 내부의 die index (dieX,dieY)
     ↓
global die coordinate
     ↓
die 측정값 = shot 측정값 상속

[Transform]
[Die to Shot based]
1. shotIndex: floor(dieIndexX / splitX)
2. innerDieIndex: dieIndex % splitX
3. ShotX: innerDieIndex * dieWidth + dieX
4. ShotGlobalX: shotIndex * shotWidth + ShotX + offsetX

[Shot to Die based]
1. innerDieIndexX: floor(shotX / dieWidth)
2. dieX: shotX % dieWidth
3. dieIndexX: shotIndexX * splitX + innerDieIndexX