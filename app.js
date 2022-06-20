const express = require('express')
const app = express()
const fetch = require('node-fetch')
const bodyParser = require('body-parser');
var cors = require('cors');

const apiUrl = 'https://disease.sh/v3/covid-19/vaccine';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const covid19VaccineData = async (req, res, next) => {
  const response = await fetch(apiUrl, {
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

const mapTrialPhases = (trialPhases) => {
  return trialPhases.map(trialPhase => {
    return {
      name: trialPhase.phase,
      candidates: trialPhase.candidates,
      color: getPhaseColor(trialPhase.phase)
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

app.get('/phases', (req, res) => {
  const phases = mapTrialPhases(res.vaccineData.phases)
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

app.listen(process.env.PORT || 3000)