import WaferFieldCDU_V6 from './WaferFieldCDU_V6'
import type { WaferFieldCDU_V6Props } from './WaferFieldCDU_V6/types'

/**
 * WaferFieldCDURealisticV6
 * Wrapper component for backward compatibility
 * 
 * 리팩토링 변경사항:
 * 1) 기본 그리기 기능만 유지 (types.ts, components 폴더)
 * 2) 데이터 로직은 custom hooks로 분리 (useCDUData, useMergeGroups, useFieldRenderItems)
 * 3) 병합 알고리즘 on/off 제어: mergeOptions.enabled
 * 4) shot index: 각 field에 자동 추가 (left-top → right-bottom)
 * 5) die index: 각 die에 자동 추가 (field 내 순서대로)
 */

/**
 * 기존 인터페이스 호환성을 위한 래퍼
 */
const WaferFieldCDURealisticV6 = (props: WaferFieldCDU_V6Props) => {
  return <WaferFieldCDU_V6 {...props} />
}

export default WaferFieldCDURealisticV6
