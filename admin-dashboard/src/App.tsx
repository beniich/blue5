import './App.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import { useState } from 'react'
import { Navbar, Button, Card, Elevation, H1, H3, Icon } from '@blueprintjs/core'

function App() {
  const [schoolStats] = useState({
    students: 1234,
    teachers: 87,
    classes: 42
  })

  const [crmStats] = useState({
    patients: 567,
    appointments: 234,
    staff: 156
  })

  return (
    <div className="bp5-dark min-h-screen bg-gray-900">
      <Navbar className="bp5-dark">
        <Navbar.Group>
          <Navbar.Heading>
            <Icon icon="dashboard" size={20} className="mr-2" />
             Admin Dashboard Pro
          </Navbar.Heading>
          <Navbar.Divider />
          <Button icon="home" text="Accueil" minimal />
          <Button icon="learning" text="École" minimal />
          <Button icon="heart" text="Hôpital" minimal />
          <Button icon="chart" text="Analytics" minimal />
        </Navbar.Group>
        <Navbar.Group align="right">
          <Button icon="notifications" minimal />
          <Button icon="cog" minimal />
          <Button icon="user" minimal />
        </Navbar.Group>
      </Navbar>

      <div className="container mx-auto p-6">
        <H1 className="mb-6 text-white">Vue d'ensemble</H1>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card elevation={Elevation.TWO} className="bg-blue-900">
            <H3 className="text-white"> School 1cc</H3>
            <div className="mt-4">
              <p className="text-4xl font-bold text-white">{schoolStats.students}</p>
              <p className="text-gray-300">Élèves</p>
              <p className="text-sm text-green-400 mt-2">+5% ce mois</p>
            </div>
          </Card>

          <Card elevation={Elevation.TWO} className="bg-green-900">
            <H3 className="text-white"> CRM Pro.cc</H3>
            <div className="mt-4">
              <p className="text-4xl font-bold text-white">{crmStats.patients}</p>
              <p className="text-gray-300">Patients</p>
              <p className="text-sm text-green-400 mt-2">+12 aujourd'hui</p>
            </div>
          </Card>

          <Card elevation={Elevation.TWO} className="bg-purple-900">
            <H3 className="text-white"> Analytics</H3>
            <div className="mt-4">
              <p className="text-4xl font-bold text-white">98.5%</p>
              <p className="text-gray-300">Performance</p>
              <p className="text-sm text-green-400 mt-2">Excellent</p>
            </div>
          </Card>
        </div>

        <Card elevation={Elevation.TWO} className="p-6">
          <H3>Power BI - Dashboard Unifié</H3>
          <div className="bg-gray-800 rounded-lg p-12 text-center mt-4">
            <Icon icon="chart" size={64} className="text-gray-600 mb-4" />
            <p className="text-gray-400">
              Configurez vos identifiants Power BI dans le fichier .env
              <br />
              <code className="text-sm">VITE_POWERBI_CLIENT_ID</code>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default App
