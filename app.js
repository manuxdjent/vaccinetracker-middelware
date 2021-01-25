const express = require('express')
const app = express()
const fetch = require('node-fetch')
const bodyParser = require('body-parser');
var cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const covid19VaccineData = async (req, res, next) => {
  const response = await fetch('https://disease.sh/v3/covid-19/vaccine', {
    method: 'GET',
    headers: {
      'Content-Type' : 'application/json'
    }
  })
  if (response) {
    const jsonResponse = await response.json()
    if (jsonResponse) {
      res.vaccineData = jsonResponse
      next()
    }
  }
}

app.use(covid19VaccineData)

const mapVaccineDataPhase = (vaccineDataPhase) => {
  return {
    name: vaccineDataPhase,
    color: getPhaseColor(vaccineDataPhase)
  }
}

const mapPhases = (phases) => {
  return phases.map(phase => {
    return {
      name: phase.phase,
      candidates: phase.candidates,
      cssClass: getPhaseCssClass(phase.phase),
      color: getPhaseColor(phase.phase)
    }
  })
}

const getPhaseColor = (phase) => {
  switch(phase) {
    case 'Phase 3':
      return 'rgb(0 255 67 / 35%)'
    case 'Phase 2/3':
      return 'rgb(122 255 0 / 35%)'
    case 'Phase 2':
      return 'rgb(251 255 0 / 35%)'
    case 'Phase 1/2':
      return 'rgb(255 153 0 / 35%)'
    case 'Phase 1':
      return 'rgb(255 82 0 / 35%)'
    case 'Pre-clinical':
      return 'rgb(255 0 0 / 35%)'
  }
}

const getPhaseCssClass = (phase) => {
  switch(phase) {
    case 'Phase 3':
      return 'phase3'
    case 'Phase 2/3':
      return 'phase23'
    case 'Phase 2':
      return 'phase2'
    case 'Phase 1/2':
      return 'phase12'
    case 'Phase 1':
      return 'phase1'
    case 'Pre-clinical':
      return 'preClinical'
  }
}

app.get('/phases', (req, res) => {
  const phases = mapPhases(res.vaccineData.phases)
  res.send(phases)
})

app.get('/totalCandidates', (req, res) => {
  const totalCandidates = Number(res.vaccineData.totalCandidates)
  res.json({ data: totalCandidates })
})

app.get('/source', (req, res) => {
  const source = res.vaccineData.source
  res.json({ data: source })
})

app.get('/data', (req, res) => {
  const data = res.vaccineData.data.map((vaccineData => {
    return {
      candidate: vaccineData.candidate,
      details: vaccineData.details,
      institutions: vaccineData.institutions,
      mechanism: vaccineData.mechanism,
      sponsors: vaccineData.sponsors,
      trialPhase: mapVaccineDataPhase(vaccineData.trialPhase)
    }
  }))
  res.send({ data: data })
})

app.listen(3000)