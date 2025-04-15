import React from 'react'
import Layout from './Layout'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import JudgementArea from './JudgementArea'

const WaferMap: React.FC = () => {
  return (
    <Layout>
      <Sidebar />
      <MainContent />
      <JudgementArea />
    </Layout>
  )
}

export default WaferMap
