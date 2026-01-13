import axios from 'axios'

const WAWP_ACCESS_TOKEN = 'mSbTPQKfwHxRr9'
const WAWP_INSTANCE_ID = '5056F80DB7AE'
const BASE_URL = 'https://wawp.net/wp-json/awp/v1'

async function testWAWP() {
  try {
    console.log('🧪 Testing WAWP API credentials...')
    console.log('Instance ID:', WAWP_INSTANCE_ID)
    console.log('Access Token:', WAWP_ACCESS_TOKEN.substring(0, 8) + '...')

    // Test 1: Check session status
    console.log('\n📊 1. Checking session status...')
    const sessionUrl = `${BASE_URL}/session/info?instance_id=${WAWP_INSTANCE_ID}&access_token=${WAWP_ACCESS_TOKEN}`
    const sessionResponse = await axios.get(sessionUrl)
    console.log('Status:', sessionResponse.data.status)

    if (sessionResponse.data.status !== 'WORKING') {
      console.error('\n❌ ERROR: Session is not working!')
      console.error('Current status:', sessionResponse.data.status)
      console.error('\n⚠️  Please go to your WAWP dashboard and:')
      console.error('- If status is STOPPED: Start the session')
      console.error('- If status is SCAN_QR_CODE: Scan the QR code to authenticate')
      console.error('- If status is FAILED: Try restarting the session')
      return
    }

    console.log('\n✅ Session is working!')

    // Test 2: Send a test message
    console.log('\n📤 2. Sending test message...')
    const testPhone = '15550123456' // Replace with your actual WhatsApp number
    const testMessage = 'Test message from WAWP API'

    const sendUrl = `${BASE_URL}/send?instance_id=${WAWP_INSTANCE_ID}&access_token=${WAWP_ACCESS_TOKEN}&chatId=${testPhone}&message=${encodeURIComponent(testMessage)}`
    console.log('Sending to:', testPhone)
    const sendResponse = await axios.post(sendUrl, {})

    console.log('\n📥 Response:')
    console.log(JSON.stringify(sendResponse.data, null, 2))

    if (sendResponse.data && sendResponse.data._data) {
      console.log('\n✅ Message sent successfully!')
      console.log('Message ID:', sendResponse.data._data.id)
    } else if (sendResponse.data && sendResponse.data.wawp_upstream_error) {
      console.error('\n❌ ERROR:', sendResponse.data.wawp_upstream_error)
    } else {
      console.error('\n❌ Unknown error')
      console.error('Response:', sendResponse.data)
    }

  } catch (error: any) {
    console.error('\n❌ Test failed!')
    if (error.response) {
      console.error('Status Code:', error.response.status)
      console.error('Error Data:', error.response.data)
    }
    console.error('Error:', error.message)
  }
}

testWAWP()
