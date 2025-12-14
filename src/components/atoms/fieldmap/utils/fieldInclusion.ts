export interface FieldInclusionConfig {
	waferRadiusMm: number
	fieldArraySize: [number, number] // [columns, rows]
	fieldSizeMm: [number, number]
	dieSizeMm: [number, number]
	dieGrid: [number, number] // [dieCols, dieRows]
	offsetMm?: [number, number]
}

export interface DiePlacement {
	center: [number, number]
	corners: [number, number][]
	fullyInside: boolean
}

export interface FieldInclusionResult {
	fx: number
	fy: number
	center: [number, number]
	included: boolean
	fullyInsideDieCount: number
	dies: DiePlacement[]
}

const EPS = 1e-9

const isRectInsideCircle = (x: number, y: number, w: number, h: number, radius: number, offsetX: number, offsetY: number) => {
	const corners: [number, number][] = [
		[x, y],
		[x + w, y],
		[x, y + h],
		[x + w, y + h],
	]

	return corners.every(([px, py]) => {
		const dx = px - offsetX
		const dy = py - offsetY
		return dx * dx + dy * dy <= radius * radius + EPS
	})
}

/**
 * 필드의 꼭지점 대신, 최소 하나의 다이가 완전히 웨이퍼 원 내부에 들어오는지로 필드 포함 여부를 판정합니다.
 */
export const computeFieldsWithDieInclusion = (config: FieldInclusionConfig): FieldInclusionResult[] => {
	const {
		waferRadiusMm,
		fieldArraySize,
		fieldSizeMm,
		dieSizeMm,
		dieGrid,
		offsetMm = [0, 0],
	} = config

	const [fieldWidth, fieldHeight] = fieldSizeMm
	const [dieWidth, dieHeight] = dieSizeMm
	const [dieCols, dieRows] = dieGrid

	const fxMin = -Math.floor(fieldArraySize[0] / 2)
	const fxMax = Math.ceil(fieldArraySize[0] / 2) - 1
	const fyMin = -Math.floor(fieldArraySize[1] / 2)
	const fyMax = Math.ceil(fieldArraySize[1] / 2) - 1

	const results: FieldInclusionResult[] = []

	for (let fy = fyMin; fy <= fyMax; fy++) {
		for (let fx = fxMin; fx <= fxMax; fx++) {
			const cx = fx * fieldWidth
			const cy = fy * fieldHeight

			const dies: DiePlacement[] = []
			let fullyInsideDieCount = 0

			for (let row = 0; row < dieRows; row++) {
				for (let col = 0; col < dieCols; col++) {
					const dieCx = cx - (dieCols * dieWidth) / 2 + (col + 0.5) * dieWidth
					const dieCy = cy - (dieRows * dieHeight) / 2 + (row + 0.5) * dieHeight

					const dieX = dieCx - dieWidth / 2
					const dieY = dieCy - dieHeight / 2

					const fullyInside = isRectInsideCircle(dieX, dieY, dieWidth, dieHeight, waferRadiusMm, offsetMm[0], offsetMm[1])
					if (fullyInside) fullyInsideDieCount += 1

					dies.push({
						center: [dieCx, dieCy],
						corners: [
							[dieX, dieY],
							[dieX + dieWidth, dieY],
							[dieX, dieY + dieHeight],
							[dieX + dieWidth, dieY + dieHeight],
						],
						fullyInside,
					})
				}
			}

			results.push({
				fx,
				fy,
				center: [cx, cy],
				included: fullyInsideDieCount > 0,
				fullyInsideDieCount,
				dies,
			})
		}
	}

	return results
}
