'use strict'

const DEBUG = process.env.DEBUG || true // turn on console logging
const FREQ = 1 // Hz
const MQTT_TOPIC = process.env.MQTT_TOPIC || '/flight/data' // topic on to which to publish
const SIM_DATA_IPADDRESS = process.env.SIM_DATA_IPADDRESS // IP address of the simulator data
const REGION = process.env.REGION || 'ap-southeast-2' // AWS region for the kinesis
const STREAM_NAME = process.env.STREAM_NAME || 'simFlightData' // kinesis stream name
const STATS_INTERVAL = 3000

// -------------------------- DO NOT EDIT BELOW THIS LINE --------------------------

const MQTT_OPTIONS = {
  reconnectPeriod: 10,
  connectTimeout: 30 * 100
}

const mqtt = require('mqtt')
const KinesisClient = require('./lib/KinesisStreamClient')
var client = undefined
var kinesisClient = undefined
var statsInterval = undefined
var putItemCount = 0
var totalPutItemCount = 0

function connect () {
  if (SIM_DATA_IPADDRESS === undefined || SIM_DATA_IPADDRESS == '') {
    if (DEBUG)
      console.log('No SIM_DATA_IPADDRESS env variable set')
    process.exit(1)
  }
  client = mqtt.connect(`mqtt://${SIM_DATA_IPADDRESS}`, MQTT_OPTIONS)
}

function startStatsCollection () {
  statsInterval = setInterval(function () {
    if (DEBUG)
      console.log(`${putItemCount}/${totalPutItemCount}/${(putItemCount/(STATS_INTERVAL/1000)).toFixed(2)}`)
    putItemCount = 0
  }, STATS_INTERVAL)
}

connect()

client.on('reconnect', () => {
  if (DEBUG)
    console.log(`reconnect to ${SIM_DATA_IPADDRESS}`)
})

client.on('error', (err) => {
  if (DEBUG)
    console.log(`err  ${err}`)
})

client.on('connect', () => {
  if (DEBUG)
    console.log(`Connected to ${SIM_DATA_IPADDRESS}`)

  kinesisClient = new KinesisClient(REGION, STREAM_NAME)
  startStatsCollection()
  client.subscribe(MQTT_TOPIC)
})

client.on('message', (topic, message) => {
  var msgJSON = message.toString()
  console.log(msgJSON)
  kinesisClient.write(msgJSON, function (ret) {
    putItemCount++
    totalPutItemCount++
  })
})
