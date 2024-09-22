const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 4000

app.use(bodyParser.json({ limit: '10mb' })) 
app.use(cors())

const user = {
    full_name: 'John_Doe',
    dob: '17091999',
    email: 'john@xyz.com',
    roll_number: 'ABCD123',
}

function getFileDetails(base64String) {
    if (!base64String || typeof base64String !== 'string') {
        return { file_valid: false }
    }

    const matches = base64String.match(/^data:(.+?);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
        return { file_valid: false }
    }

    const mimeType = matches[1] 
    const fileData = matches[2] 

    const fileSizeInBytes = Buffer.from(fileData, 'base64').length
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2)

    return {
        file_valid: true,
        file_mime_type: mimeType,
        file_size_kb: fileSizeInKB,
    }
}

app.post('/bfhl', (req, res) => {
    try {
        const { data, file_b64 } = req.body

        if (!Array.isArray(data)) {
            return res.status(400).json({ is_success: false, message: 'Invalid data format' })
        }

        const response = {
            is_success: true,
            user_id: `${user.full_name}_${user.dob}`,
            email: user.email,
            roll_number: user.roll_number,
            numbers: [],
            alphabets: [],
            highest_lowercase_alphabet: [],
        }

        data.forEach((item) => {
            if (typeof item === 'string' && /^[A-Za-z]$/.test(item)) {
                response.alphabets.push(item)
            } else if (!isNaN(item)) {
                response.numbers.push(item)
            }
        })

        const lowercaseAlphabets = response.alphabets.filter((char) =>
            /^[a-z]$/.test(char)
        )
        if (lowercaseAlphabets.length > 0) {
            response.highest_lowercase_alphabet = [
                lowercaseAlphabets.reduce((a, b) => (a > b ? a : b)),
            ]
        }

        const fileDetails = getFileDetails(file_b64)
        response.file_valid = fileDetails.file_valid

        if (fileDetails.file_valid) {
            response.file_mime_type = fileDetails.file_mime_type
            response.file_size_kb = fileDetails.file_size_kb
        }

        res.json(response)
    } catch (error) {
        res.status(500).json({ is_success: false, message: 'Internal Server Error' })
    }
})

app.get('/bfhl', (req, res) => {
    res.status(200).json({ operation_code: 1 })
})

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Bajaj Finserv Health Dev Challenge!' })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

module.exports = app
