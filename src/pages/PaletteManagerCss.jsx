import React, { useState } from 'react'
import { Select, Radio, Button, Input, Card, Space, Divider, message, Slider, InputNumber } from 'antd'
import { ColorPicker } from 'antd'
import { BgColorsOutlined, BarsOutlined } from '@ant-design/icons'
import styled from 'styled-components'

const { Option } = Select

// --- styled-components 정의 ---
const Container = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 32px;
`
const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 8px 0 18px 0;
  font-size: 15px;
`
const SearchLabel = styled.span`
  font-weight: 500;
  margin-right: 4px;
  color: #333;
  font-size: 14px;
`
const Body = styled.div`
  display: flex;
  gap: 32px;
`
const Left = styled.div`
  width: 100%;
  max-width: 420px;
`
const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`
const StyledCard = styled(Card)`
  flex: 1 1 calc(33% - 12px);
  min-width: 120px;
  max-width: 140px;
  box-sizing: border-box;
  margin-bottom: 8px;
  cursor: pointer;
  &.active {
    border: 2px solid #1677ff;
  }
`
const CardTitle = styled.span`
  font-weight: 500;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const CardPreview = styled.span`
  display: flex;
  align-items: center;
  width: 100px;
  height: 24px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 0;
`
const ColorBox = styled.span`
  width: 24px;
  height: 100%;
  display: inline-block;
`
const Right = styled.div`
  flex: 1;
  min-width: 320px;
`
const GlobalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`
const PaletteGradBar = styled.span`
  flex: 1;
  height: 16px;
  border-radius: 8px;
  margin: 0 8px;
`
const PalettePreviewGradation = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const PalettePreviewStep = styled.div`
  display: flex;
  gap: 2px;
`
const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`
const Label = styled.span`
  display: inline-block;
  width: 90px;
`
const Placeholder = styled.div`
  color: #aaa;
  padding: 32px 0;
  text-align: center;
`
const StyledInputNumber = styled(InputNumber)`
  width: 80px !important;
  min-width: 80px !important;
  max-width: 100px;
`

// --- 타입 및 데이터 ---
type PaletteType = 'Step' | 'Gradation'
type PaletteGroup = {
  name: string
  type: PaletteType
  colors: string[]
  stops?: { from: number; to: number }[]
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

// --- 컴포넌트 ---
export default function PaletteManager() {
  // ...state 및 함수는 기존과 동일...

  // 기존 코드 그대로, styled-components만 적용
  // 아래 renderDetailPanel, getTypeIcon 등은 기존과 동일

  // Type별 아이콘 반환 함수
  const getTypeIcon = (type: PaletteType) =>
    type === 'Gradation' ? (
      <BgColorsOutlined style={{ color: '#ff9800', fontSize: 18, marginRight: 4 }} />
    ) : (
      <BarsOutlined style={{ color: '#2196f3', fontSize: 18, marginRight: 4 }} />
    )

  // ...이하 기존 코드 유지, 단 className 대신 styled 컴포넌트로 대체...

  // renderDetailPanel 함수 내에서 className 대신 styled 사용
  // 예시: <div className='palette-preview-gradation'> → <PalettePreviewGradation>
  //       <span className='palette-grad-bar'> → <PaletteGradBar>
  //       <div className='color-row'> → <ColorRow>
  //       <span className='label'> → <Label>
  //       <InputNumber ... style={{ width: 80 }} → <StyledInputNumber ... />

  return (
    <Container>
      {/* 상단 검색 조건 */}
      <SearchBar>
        <SearchLabel>Fab</SearchLabel>
        <Select
          value={fab}
          onChange={setFab}
          size='small'
          style={{ width: 100, marginRight: 10 }}
          dropdownStyle={{ fontSize: 14 }}>
          <Option value='fab1'>Fab 1</Option>
          <Option value='fab2'>Fab 2</Option>
        </Select>
        <SearchLabel>Share</SearchLabel>
        <Radio.Group
          value={share}
          onChange={(e) => setShare(e.target.value)}
          size='small'
          style={{ margin: '0 10px 0 4px' }}>
          <Radio value='public'>Public</Radio>
          <Radio value='private'>Private</Radio>
        </Radio.Group>
        <SearchLabel>Group</SearchLabel>
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
      </SearchBar>

      <Body>
        {/* 좌측: Palette Group Card 리스트 */}
        <Left>
          <h3>Palette Groups</h3>
          <CardList>
            {filteredGroups.map((group) => (
              <StyledCard
                key={group.name}
                size='small'
                className={selectedGroup?.name === group.name ? 'active' : ''}
                onClick={() => handleCardClick(group)}
                bodyStyle={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {getTypeIcon(group.type)}
                    <CardTitle>{group.name}</CardTitle>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    {group.type === 'Gradation' ? (
                      <CardPreview
                        style={{
                          background: `linear-gradient(90deg, ${group.colors[0]}, ${group.colors[1]})`,
                        }}
                      />
                    ) : (
                      <CardPreview>
                        {group.colors.map((c, i) => (
                          <ColorBox key={i} style={{ background: c }} />
                        ))}
                      </CardPreview>
                    )}
                  </div>
                </div>
              </StyledCard>
            ))}
          </CardList>
          <Button type='dashed' block style={{ marginTop: 8 }} onClick={handleAddNew}>
            + Add New
          </Button>
        </Left>

        {/* 우측: 상세 패널 */}
        <Right>{renderDetailPanel()}</Right>
      </Body>

      {/* 하단 글로벌 버튼 */}
      <Divider />
      <GlobalActions>
        <Button type='primary' style={{ marginRight: 8 }}>
          Apply
        </Button>
        <Button>Close</Button>
      </GlobalActions>
    </Container>
  )
}