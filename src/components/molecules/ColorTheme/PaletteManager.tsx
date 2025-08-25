import React, { useState } from 'react'
import { Select, Radio, Button, Input, Card, Space, Divider, message, Slider, InputNumber } from 'antd'
import { ColorPicker } from 'antd'
import { BgColorsOutlined, BarsOutlined } from '@ant-design/icons'
import './PaletteManager.css'
import { usePalette } from '../../../app/usePalette'

const { Option } = Select

type PaletteType = 'Step' | 'Gradation'
type PaletteGroup = {
  name: string
  type: PaletteType
  colors: string[]
  stops?: { from: number; to: number }[] // Step용: 각 색상 구간
}

type PaletteManagertProps = {
  onClose?: () => void
}

const initialGroups: PaletteGroup[] = [
  { name: 'Warm Sunset', type: 'Gradation', colors: ['#FF9800', '#FFD600'] },
  { name: 'Cool Ocean', type: 'Gradation', colors: ['#2196F3', '#00BCD4'] },
  { name: 'Bright', type: 'Gradation', colors: ['#8BC34A', '#FFEB3B'] },
  { name: 'Purple Dream', type: 'Gradation', colors: ['#8e24aa', '#e1bee7'] },
  { name: 'Fire', type: 'Gradation', colors: ['#ff512f', '#dd2476'] },
  { name: 'Aqua', type: 'Gradation', colors: ['#43cea2', '#185a9d'] },
  { name: 'Sunrise', type: 'Gradation', colors: ['#ff512f', '#f09819'] },
  { name: 'Night Sky', type: 'Gradation', colors: ['#232526', '#414345'] },
  { name: 'Candy', type: 'Gradation', colors: ['#ffb347', '#ffcc33'] },
  { name: 'Peach', type: 'Gradation', colors: ['#ed4264', '#ffedbc'] },
  { name: 'Mint', type: 'Gradation', colors: ['#76b852', '#8DC26F'] },
  { name: 'Ocean Blue', type: 'Gradation', colors: ['#2193b0', '#6dd5ed'] },
  { name: 'Sunset', type: 'Gradation', colors: ['#0b486b', '#f56217'] },
  { name: 'Rose', type: 'Gradation', colors: ['#e96443', '#904e95'] },
  { name: 'Lime', type: 'Gradation', colors: ['#a8ff78', '#78ffd6'] },
  {
    name: 'Forest',
    type: 'Step',
    colors: [
      '#ee986aff',
      '#d5ec84ff',
      '#93da9fff',
      '#388E3C',
      '#4cacafff',
      '#193ee4ff',
      '#9216bbff',
      '#6b064bff',
      '#d91e30ff',
      '#14503aff',
      '#f5f76eff',
    ],
    stops: [
      { from: 0, to: 13.33 },
      { from: 13.34, to: 23.0 },
      { from: 23.01, to: 30.0 },
      { from: 30.01, to: 40.0 },
      { from: 40.01, to: 50.0 },
      { from: 50.01, to: 64.0 },
      { from: 60.01, to: 74.0 },
      { from: 70.01, to: 84.0 },
      { from: 80.01, to: 94.0 },
      { from: 90.01, to: 95.0 },
      { from: 95.01, to: 100 },
    ],
  },
  {
    name: 'Pastel',
    type: 'Step',
    colors: ['#F8BBD0', '#FFF9C4'],
    stops: [
      { from: 0, to: 49.99 },
      { from: 50, to: 100 },
    ],
  },
  {
    name: 'Dark',
    type: 'Step',
    colors: ['#263238', '#455A64'],
    stops: [
      { from: 0, to: 49.99 },
      { from: 50, to: 100 },
    ],
  },
  {
    name: 'Rainbow',
    type: 'Step',
    colors: ['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff'],
    stops: [
      { from: 0, to: 14.28 },
      { from: 14.29, to: 28.57 },
      { from: 28.58, to: 42.85 },
      { from: 42.86, to: 57.14 },
      { from: 57.15, to: 71.42 },
      { from: 71.43, to: 85.71 },
      { from: 85.72, to: 100 },
    ],
  },
  {
    name: 'Earth',
    type: 'Step',
    colors: ['#a0522d', '#cd853f', '#deb887', '#f5deb3', '#fff8dc'],
    stops: [
      { from: 0, to: 20 },
      { from: 20.01, to: 40 },
      { from: 40.01, to: 60 },
      { from: 60.01, to: 80 },
      { from: 80.01, to: 100 },
    ],
  },
  {
    name: 'Ice',
    type: 'Step',
    colors: ['#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da'],
    stops: [
      { from: 0, to: 20 },
      { from: 20.01, to: 40 },
      { from: 40.01, to: 60 },
      { from: 60.01, to: 80 },
      { from: 80.01, to: 100 },
    ],
  },
  {
    name: 'Fire Step',
    type: 'Step',
    colors: ['#ff512f', '#f09819', '#ffd700', '#ff6f00'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Ocean Step',
    type: 'Step',
    colors: ['#2193b0', '#6dd5ed', '#00b4db', '#0083b0'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Pink Step',
    type: 'Step',
    colors: ['#ffb6b9', '#fae3d9', '#bbded6', '#8ac6d1'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Citrus',
    type: 'Step',
    colors: ['#f9d423', '#ff4e50', '#e1eec3', '#f05053'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Sky',
    type: 'Step',
    colors: ['#2980b9', '#6dd5fa', '#ffffff'],
    stops: [
      { from: 0, to: 33.33 },
      { from: 33.34, to: 66.66 },
      { from: 66.67, to: 100 },
    ],
  },
  {
    name: 'Autumn',
    type: 'Step',
    colors: ['#ff9966', '#ff5e62', '#ffb347', '#ffcc33'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Violet',
    type: 'Step',
    colors: ['#a18cd1', '#fbc2eb', '#fad0c4', '#ffd1ff'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Lemon',
    type: 'Step',
    colors: ['#f9f047', '#f9d423', '#f6e27a', '#f9d423'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Berry',
    type: 'Step',
    colors: ['#b721ff', '#21d4fd', '#fdbb2d', '#22c1c3'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Moss',
    type: 'Step',
    colors: ['#a8e063', '#56ab2f', '#b6e064', '#8fd3f4'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Stone',
    type: 'Step',
    colors: ['#757f9a', '#d7dde8', '#b7b7b7', '#757f9a'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Sand',
    type: 'Step',
    colors: ['#fceabb', '#f8b500', '#fceabb', '#f8b500'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Olive',
    type: 'Step',
    colors: ['#b4ec51', '#429321', '#b4ec51', '#429321'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Coral',
    type: 'Step',
    colors: ['#ff9966', '#ff5e62', '#ffb347', '#ffcc33'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Steel',
    type: 'Step',
    colors: ['#485563', '#29323c', '#485563', '#29323c'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
  {
    name: 'Peach',
    type: 'Step',
    colors: ['#ffecd2', '#fcb69f', '#ffecd2', '#fcb69f'],
    stops: [
      { from: 0, to: 25 },
      { from: 25.01, to: 50 },
      { from: 50.01, to: 75 },
      { from: 75.01, to: 100 },
    ],
  },
]

export default function PaletteManager({ onClose }: PaletteManagertProps) {
  const [fab, setFab] = useState('fab1')
  const [share, setShare] = useState<'public' | 'private'>('public')
  const [groups, setGroups] = useState<PaletteGroup[]>(initialGroups)
  const [groupFilter, setGroupFilter] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<PaletteGroup | null>(null)
  const [mode, setMode] = useState<'view' | 'add' | 'edit' | undefined>('view')
  const { setAppliedPalette } = usePalette()

  // 신규/수정 입력 상태
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<PaletteType>('Step')
  const [editColors, setEditColors] = useState<string[]>(['#1890ff', '#f5222d'])
  const [editStops, setEditStops] = useState<{ from: number; to: number }[]>([
    { from: 0, to: 49.99 },
    { from: 50, to: 100 },
  ])

  // 그룹명 목록 추출
  const groupNames = Array.from(new Set(groups.map((g) => g.name)))
  const [groupSelect, setGroupSelect] = useState<string | undefined>(undefined)

  // 그룹 필터링: groupSelect가 있으면 해당 그룹만, 없으면 기존 필터
  const filteredGroups = groups.filter((g) =>
    groupSelect ? g.name === groupSelect : !groupFilter || g.name.toLowerCase().includes(groupFilter.toLowerCase()),
  )

  // group name 필수값 체크
  const isGroupNameError = (mode === 'add' || mode === 'edit') && !editName.trim()

  // Type별 아이콘 반환 함수
  const getTypeIcon = (type: PaletteType) =>
    type === 'Gradation' ? (
      <BgColorsOutlined style={{ color: '#ff9800', fontSize: 18, marginRight: 4 }} />
    ) : (
      <BarsOutlined style={{ color: '#2196f3', fontSize: 18, marginRight: 4 }} />
    )

  // Color Palette 구간 중복 체크 (Step 타입일 때만)
  function getRangeOverlapError(stops: { from: number; to: number }[]) {
    for (let i = 0; i < stops.length; i++) {
      const a = stops[i]
      if (a.from > a.to) return i // from이 to보다 크면 에러
      for (let j = i + 1; j < stops.length; j++) {
        const b = stops[j]
        // 구간이 겹치는지 확인
        if (a.from <= b.to && a.to >= b.from) {
          return i // i번째 구간이 겹침
        }
      }
    }
    return -1
  }
  const overlapIdx = (mode === 'add' || mode === 'edit') && editType === 'Step' ? getRangeOverlapError(editStops) : -1

  // 수정모드에서 Reset 기능
  const handleReset = () => {
    if (selectedGroup) {
      setEditName(selectedGroup.name)
      setEditType(selectedGroup.type)
      setEditColors([...selectedGroup.colors])
      setEditStops(
        selectedGroup.stops
          ? selectedGroup.stops.map((s) => ({ ...s }))
          : selectedGroup.colors.map((_, i, arr) => ({
              from: i === 0 ? 0 : Number(((100 / arr.length) * i).toFixed(2)),
              to: Number(((100 / arr.length) * (i + 1) - 0.01).toFixed(2)),
            })),
      )
    }
  }

  // 카드 클릭 시 상세 패널(비활성화)로
  const handleCardClick = (group: PaletteGroup) => {
    setSelectedGroup(group)
    setEditName(group.name)
    setEditType(group.type)
    setEditColors([...group.colors])
    setEditStops(
      group.stops
        ? group.stops.map((s) => ({ ...s }))
        : group.colors.map((_, i, arr) => ({
            from: i === 0 ? 0 : Number(((100 / arr.length) * i).toFixed(2)),
            to: Number(((100 / arr.length) * (i + 1) - 0.01).toFixed(2)),
          })),
    )
    setMode('view')
  }

  // 신규 등록 모드 진입
  const handleAddNew = () => {
    setSelectedGroup(null)
    setEditName('')
    setEditType('Gradation')
    setEditColors(['#000000', '#FFFF00'])
    setEditStops([
      { from: 0, to: 49.99 },
      { from: 50, to: 100 },
    ])
    setMode('add')
  }

  // 저장(신규/수정)
  const handleSave = () => {
    if (!editName.trim()) {
      message.warning('Group Name을 입력하세요.')
      return
    }
    if (editType === 'Gradation' && editColors.length !== 2) {
      message.warning('From/To 컬러를 지정하세요.')
      return
    }
    if (editType === 'Step' && editColors.length < 2) {
      message.warning('Step 팔레트는 2개 이상 컬러가 필요합니다.')
      return
    }
    if (mode === 'add') {
      setGroups([
        ...groups,
        {
          name: editName,
          type: editType,
          colors: [...editColors],
          stops: editType === 'Step' ? [...editStops] : undefined,
        },
      ])
      setSelectedGroup({
        name: editName,
        type: editType,
        colors: [...editColors],
        stops: editType === 'Step' ? [...editStops] : undefined,
      })
      setMode('view')
    } else if (mode === 'edit' && selectedGroup) {
      setGroups(
        groups.map((g) =>
          g.name === selectedGroup.name
            ? {
                name: editName,
                type: editType,
                colors: [...editColors],
                stops: editType === 'Step' ? [...editStops] : undefined,
              }
            : g,
        ),
      )
      setSelectedGroup({
        name: editName,
        type: editType,
        colors: [...editColors],
        stops: editType === 'Step' ? [...editStops] : undefined,
      })
      setMode('view')
    }
  }

  // 삭제
  const handleDelete = () => {
    if (selectedGroup) {
      setGroups(groups.filter((g) => g.name !== selectedGroup.name))
      setSelectedGroup(null)
      setMode('view')
    }
  }

  // Step 팔레트 행 추가
  const handleAddRow = () => {
    const lastTo = editStops[editStops.length - 1]?.to ?? 100
    setEditStops([...editStops, { from: lastTo + 0.01, to: 100 }])
    setEditColors([...editColors, '#1890ff'])
  }
  // Step 팔레트 행 삭제
  const handleRemoveRow = (idx: number) => {
    setEditStops(editStops.filter((_, i) => i !== idx))
    setEditColors(editColors.filter((_, i) => i !== idx))
  }
  // Step 팔레트 순서 변경
  const handleMoveRow = (idx: number, dir: -1 | 1) => {
    const arr = [...editColors]
    const stopsArr = [...editStops]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= arr.length) return
    ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
    ;[stopsArr[idx], stopsArr[swapIdx]] = [stopsArr[swapIdx], stopsArr[idx]]
    setEditColors(arr)
    setEditStops(stopsArr)
  }

  // Step 팔레트 슬라이더/숫자 연동
  const handleStopChange = (idx: number, key: 'from' | 'to', value: number) => {
    const arr = [...editStops]
    arr[idx][key] = value
    // 연속성 보장: 이전/다음 구간과 연결
    if (key === 'to' && idx < arr.length - 1) arr[idx + 1].from = Number((value + 0.01).toFixed(2))
    if (key === 'from' && idx > 0) arr[idx - 1].to = Number((value - 0.01).toFixed(2))
    setEditStops(arr)
  }

  // Apply 버튼 클릭 시 현재 선택된 팔레트 적용
  const handleApply = () => {
    if (selectedGroup) {
      setAppliedPalette(selectedGroup)
      message.success(`팔레트 "${selectedGroup.name}"이(가) 적용되었습니다.`)
      if (onClose) onClose()
    } else {
      message.warning('적용할 팔레트를 선택하세요.')
    }
  }

  // 상세 패널 렌더링
  const renderDetailPanel = () => {
    // 조회 모드 (disabled)
    if (mode === 'view' && selectedGroup) {
      return (
        <Card title={selectedGroup.name} extra={<Button onClick={() => setMode('edit')}>Edit</Button>}>
          <div style={{ marginBottom: 12 }}>
            <b>Type:</b> {selectedGroup.type}
          </div>
          <div style={{ marginBottom: 12 }}>
            <b>Color Palette:</b>
            {selectedGroup.type === 'Gradation' ? (
              <div className='palette-preview-gradation'>
                <span className='palette-color-box' style={{ background: selectedGroup.colors[0] }} />
                <span
                  className='palette-grad-bar'
                  style={{
                    background: `linear-gradient(90deg, ${selectedGroup.colors[0]}, ${selectedGroup.colors[1]})`,
                  }}
                />
                <span className='palette-color-box' style={{ background: selectedGroup.colors[1] }} />
              </div>
            ) : (
              <div className='palette-preview-step'>
                {selectedGroup.colors.map((c, i) => (
                  <div className='color-row' key={i}>
                    <span style={{ width: 24, textAlign: 'center', color: '#888' }}>{i + 1}</span>
                    <Slider
                      min={0}
                      max={100}
                      step={0.01}
                      range
                      value={[selectedGroup.stops?.[i]?.from ?? 0, selectedGroup.stops?.[i]?.to ?? 100]}
                      style={{ width: 120, marginRight: 8 }}
                      disabled
                    />
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.01}
                      value={selectedGroup.stops?.[i]?.from ?? 0}
                      style={{ width: 60 }}
                      disabled
                    />
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.01}
                      value={selectedGroup.stops?.[i]?.to ?? 100}
                      style={{ width: 60, marginRight: 8 }}
                      disabled
                    />
                    <ColorPicker value={c} disabled style={{ marginRight: 8 }} />
                    <span style={{ width: 70, fontFamily: 'monospace', color: '#888' }}>{c.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Space>
            <Button danger disabled>
              Delete
            </Button>
            <Button disabled>Save</Button>
            <Button onClick={() => setMode(undefined)}>Cancel</Button>
          </Space>
        </Card>
      )
    }

    // 신규/수정 모드
    if (mode === 'add' || mode === 'edit') {
      return (
        <Card title={mode === 'add' ? 'New Palette' : 'Edit Palette'}>
          <Space direction='vertical' style={{ width: '100%' }}>
            <div>
              <span className='label'>Group Name</span>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                status={isGroupNameError ? 'error' : ''}
                placeholder='필수 입력'
              />
              {isGroupNameError && (
                <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 2 }}>Group Name은 필수입니다.</div>
              )}
            </div>
            <div>
              <span className='label'>Type</span>
              <Radio.Group
                value={editType}
                onChange={(e) => {
                  setEditType(e.target.value)
                  setEditColors(e.target.value === 'Gradation' ? ['#000000', '#FFFF00'] : ['#1890ff', '#f5222d'])
                  setEditStops(
                    e.target.value === 'Step'
                      ? [
                          { from: 0, to: 49.99 },
                          { from: 50, to: 100 },
                        ]
                      : [],
                  )
                }}>
                <Radio value='Step'>Step</Radio>
                <Radio value='Gradation'>Gradation</Radio>
              </Radio.Group>
            </div>
            <div>
              <span className='label'>Color Palette</span>
              {editType === 'Gradation' ? (
                <div className='palette-preview-gradation'>
                  <ColorPicker
                    value={editColors[0]}
                    onChange={(c) => setEditColors([c.toHexString(), editColors[1]])}
                  />
                  <span style={{ width: 70, fontFamily: 'monospace', color: '#888' }}>
                    {editColors[0].toUpperCase()}
                  </span>
                  <span
                    className='palette-grad-bar'
                    style={{
                      background: `linear-gradient(90deg, ${editColors[0]}, ${editColors[1]})`,
                    }}
                  />
                  <ColorPicker
                    value={editColors[1]}
                    onChange={(c) => setEditColors([editColors[0], c.toHexString()])}
                  />
                  <span style={{ width: 70, fontFamily: 'monospace', color: '#888' }}>
                    {editColors[1].toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className='palette-preview-step'>
                  {editColors.map((color, idx) => (
                    <div className='color-row' key={idx}>
                      <span style={{ width: 24, textAlign: 'center', color: '#888' }}>{idx + 1}</span>
                      <Slider
                        min={0}
                        max={100}
                        step={0.01}
                        range
                        value={[editStops[idx]?.from ?? 0, editStops[idx]?.to ?? 100]}
                        style={{ width: 120, marginRight: 8 }}
                        onChange={([from, to]) => handleStopChange(idx, 'from', Number(from))}
                        onAfterChange={([from, to]) => handleStopChange(idx, 'to', Number(to))}
                        status={overlapIdx === idx ? 'error' : ''}
                      />
                      <InputNumber
                        min={0}
                        max={100}
                        step={0.01}
                        value={editStops[idx]?.from ?? 0}
                        style={{ width: 60 }}
                        onChange={(v) => handleStopChange(idx, 'from', Number(v))}
                        status={
                          editStops[idx]?.from === undefined || editStops[idx]?.from === null || overlapIdx === idx
                            ? 'error'
                            : ''
                        }
                        placeholder='From'
                      />
                      <InputNumber
                        min={0}
                        max={100}
                        step={0.01}
                        value={editStops[idx]?.to ?? 100}
                        style={{ width: 60, marginRight: 8 }}
                        onChange={(v) => handleStopChange(idx, 'to', Number(v))}
                        status={
                          editStops[idx]?.to === undefined || editStops[idx]?.to === null || overlapIdx === idx
                            ? 'error'
                            : ''
                        }
                        placeholder='To'
                      />
                      <ColorPicker
                        value={color}
                        onChange={(c) => {
                          const arr = [...editColors]
                          arr[idx] = c.toHexString()
                          setEditColors(arr)
                        }}
                      />
                      <span style={{ width: 70, fontFamily: 'monospace', color: '#888' }}>{color.toUpperCase()}</span>
                      <Button size='small' onClick={() => handleMoveRow(idx, -1)} disabled={idx === 0}>
                        ▲
                      </Button>
                      <Button
                        size='small'
                        onClick={() => handleMoveRow(idx, 1)}
                        disabled={idx === editColors.length - 1}>
                        ▼
                      </Button>
                      <Button
                        size='small'
                        danger
                        onClick={() => handleRemoveRow(idx)}
                        disabled={editColors.length <= 2}>
                        X
                      </Button>
                    </div>
                  ))}
                  {overlapIdx !== -1 && (
                    <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 2 }}>
                      {overlapIdx >= 0 ? `Color Palette의 ${overlapIdx + 1}번째 구간이 다른 구간과 중복됩니다.` : ''}
                    </div>
                  )}
                  <Button type='dashed' block onClick={handleAddRow}>
                    + Add Row
                  </Button>
                </div>
              )}
            </div>
            <Space>
              {mode === 'edit' && (
                <>
                  <Button onClick={handleReset}>Reset</Button>
                  <Button danger onClick={handleDelete}>
                    Delete
                  </Button>
                </>
              )}
              <Button type='primary' onClick={handleSave}>
                {(mode === 'add' && 'Regist') || 'Save'}
              </Button>
              <Button onClick={() => setMode('view')}>Cancel</Button>
            </Space>
          </Space>
        </Card>
      )
    }

    return <div className='placeholder'>팔레트 상세를 선택하세요</div>
  }

  return (
    <div className='palette-container'>
      {/* 상단 검색 조건 */}
      <div className='palette-search improved'>
        <span className='palette-search-label'>Fab</span>
        <Select
          value={fab}
          onChange={setFab}
          size='small'
          style={{ width: 100, marginRight: 10 }}
          dropdownStyle={{ fontSize: 14 }}>
          <Option value='fab1'>Fab 1</Option>
          <Option value='fab2'>Fab 2</Option>
        </Select>
        <span className='palette-search-label'>Share</span>
        <Radio.Group
          value={share}
          onChange={(e) => setShare(e.target.value)}
          size='small'
          style={{ margin: '0 10px 0 4px' }}>
          <Radio value='public'>Public</Radio>
          <Radio value='private'>Private</Radio>
        </Radio.Group>
        <span className='palette-search-label'>Group</span>
        <Select
          allowClear
          placeholder='Group 선택'
          value={groupSelect}
          onChange={(value) => setGroupSelect(value)}
          size='small'
          style={{ width: 120, marginLeft: 4 }}
          dropdownStyle={{ fontSize: 14 }}>
          {groupNames.map((name) => (
            <Option key={name} value={name}>
              {name}
            </Option>
          ))}
        </Select>
      </div>

      <div className='palette-body'>
        {/* 좌측: Palette Group Card 리스트 */}
        <div className='palette-left palette-card-grid'>
          <h3>Palette Groups</h3>
          <div className='palette-card-list'>
            {filteredGroups.map((group) => (
              <Card
                key={group.name}
                size='small'
                className={`palette-card ${selectedGroup?.name === group.name ? 'active' : ''}`}
                onClick={() => handleCardClick(group)}
                style={{ marginBottom: 8, cursor: 'pointer', minWidth: 0 }}
                bodyStyle={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* 팔레트 미리보기 */}

                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {getTypeIcon(group.type)}
                    <span className='palette-card-title'>{group.name}</span>
                  </div>
                  {/* 팔레트 미리보기: 두 번째 줄 */}
                  <div style={{ marginTop: 6 }}>
                    {group.type === 'Gradation' ? (
                      <span
                        className='palette-card-preview'
                        style={{
                          background: `linear-gradient(90deg, ${group.colors[0]}, ${group.colors[1]})`,
                        }}
                      />
                    ) : (
                      <span className='palette-card-preview'>
                        {group.colors.map((c, i) => (
                          <span key={i} className='palette-color-box' style={{ background: c }} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Button type='dashed' block style={{ marginTop: 8 }} onClick={handleAddNew}>
            + Add New
          </Button>
        </div>

        {/* 우측: 상세 패널 */}
        <div className='palette-right'>{renderDetailPanel()}</div>
      </div>

      {/* 하단 글로벌 버튼 */}
      <Divider />
      <div className='palette-global-actions'>
        <Button type='primary' style={{ marginRight: 8 }} onClick={handleApply}>
          Apply
        </Button>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}
