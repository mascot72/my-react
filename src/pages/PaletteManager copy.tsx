import React, { useState } from 'react'
import { Select, Radio, Button, Input, Card, Space, Divider, message, Slider, InputNumber } from 'antd'
import { ColorPicker } from 'antd'
import { BgColorsOutlined, BarsOutlined } from '@ant-design/icons'
import './PaletteManager.css'

const { Option } = Select

type PaletteType = 'Step' | 'Gradation'
type PaletteGroup = {
  name: string
  type: PaletteType
  colors: string[]
  stops?: { from: number; to: number }[] // Step용: 각 색상 구간
}

const initialGroups: PaletteGroup[] = [
  { name: 'Warm Sunset', type: 'Gradation', colors: ['#FF9800', '#FFD600'] },
  { name: 'Cool Ocean', type: 'Gradation', colors: ['#2196F3', '#00BCD4'] },
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
  { name: 'Bright', type: 'Gradation', colors: ['#8BC34A', '#FFEB3B'] },
]

export default function PaletteManager() {
  const [fab, setFab] = useState('fab1')
  const [share, setShare] = useState<'public' | 'private'>('public')
  const [groups, setGroups] = useState<PaletteGroup[]>(initialGroups)
  const [groupFilter, setGroupFilter] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<PaletteGroup | null>(null)
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view')

  // 신규/수정 입력 상태
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<PaletteType>('Step')
  const [editColors, setEditColors] = useState<string[]>(['#1890ff', '#f5222d'])
  const [editStops, setEditStops] = useState<{ from: number; to: number }[]>([
    { from: 0, to: 49.99 },
    { from: 50, to: 100 },
  ])

  // 그룹 필터링
  // const filteredGroups = groups.filter((g) => !groupFilter || g.name.toLowerCase().includes(groupFilter.toLowerCase()))

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
              <div>
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
            <Button onClick={() => setMode('view')}>Cancel</Button>
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
                <div>
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
                Save
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
                {/* {group.type === 'Gradation' ? (
                  <span
                    className='palette-card-preview'
                    // style={{
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
                <div>
                  <div className='palette-card-title'>{group.name}</div>
                  <div className='palette-card-type'>Type: {group.type}</div>
                </div> */}

                {/* <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {getTypeIcon(group.type)}
                  <div>
                    <div className='palette-card-title'>{group.name}</div>
                  </div>
                </div> */}

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
        <Button type='primary' style={{ marginRight: 8 }}>
          Apply
        </Button>
        <Button>Close</Button>
      </div>
    </div>
  )
}
