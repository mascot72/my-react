import React from 'react'
import styled from 'styled-components'

const JudgementContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: center;
  }

  th {
    background-color: #f0f0f0;
  }
`

const Status = styled.div<{ status: 'PASS' | 'FAIL' }>`
  font-size: 1.5rem;
  color: ${(props) => (props.status === 'PASS' ? 'green' : 'red')};
  text-align: center;
`

const JudgementArea: React.FC = () => {
  return (
    <JudgementContainer>
      <Table>
        <thead>
          <tr>
            <th>Spec</th>
            <th>Val</th>
            <th>Pass/Fail</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>TTFV</td>
            <td>12.46</td>
            <td>FAIL</td>
          </tr>
          <tr>
            <td>BOW</td>
            <td>3.92</td>
            <td>PASS</td>
          </tr>
        </tbody>
      </Table>
      <Status status='PASS'>JUDGE: PASS</Status>
    </JudgementContainer>
  )
}

export default JudgementArea
