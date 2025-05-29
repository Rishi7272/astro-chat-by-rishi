const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const { moonposition, julian } = require('astronomia');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from "public" folder (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Tamil Raasi and Nakshatra names
const RAASI_NAMES = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];
const NAKSHATRA_NAMES = [
  'அசுவினி','பரணி','கிருத்திகை','ரோகிணி','மிருகசீரிஷம்','திருவாதிரை','புனர்பூசம்',
  'பூசம்','ஆயில்யம்','மகம்','பூரம்','உத்திரம்','ஹஸ்தம்','சித்திரை','சுவாதி',
  'விசாகம்','அனுராதா','ஜ்யேஷ்டா','மூலம்','பூராடம்','உத்திராடம்','திருவோணம்',
  'அவிட்டம்','சதயம்','பூரட்டாதி','உத்திரட்டாதி','ரேவதி'
];

// English Raasi and Nakshatra names
const RAASI_NAMES_EN = [
  'Mesham', 'Rishabam', 'Mithunam', 'Kadagam', 'Simmam', 'Kanni',
  'Thulam', 'Viruchigam', 'Dhanusu', 'Magaram', 'Kumbam', 'Meenam'
];
const NAKSHATRA_NAMES_EN = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Thiruvathirai', 'Punarpoosam',
  'Poosam', 'Aayilyam', 'Magam', 'Pooram', 'Uthiram', 'Hastham', 'Chithirai', 'Swathi',
  'Visakam', 'Anuradha', 'Jyeshta', 'Moolam', 'Pooradam', 'Uthradam', 'Thiruvonam',
  'Avittam', 'Sathayam', 'Pooratathi', 'Uthratathi', 'Revathi'
];

function getRaasiIndex(moonLongitude) {
  return Math.floor(moonLongitude / 30) % 12;
}
function getNakshatraIndex(moonLongitude) {
  return Math.floor(moonLongitude / (360 / 27)) % 27;
}

// API Route
app.post('/api/astro', (req, res) => {
  try {
    const { name, dob, tob, place } = req.body;

    if (!name || !dob || !tob) {
      return res.status(400).json({ error: 'Please provide all required details (name, dob, tob).' });
    }

    // Parse date and time of birth into a Date object
    const [year, month, day] = dob.split('-').map(Number);
    const [hour, minute] = tob.split(':').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute));

    // Calculate Julian date
    const jd = julian.CalendarGregorianToJD(
      dateObj.getUTCFullYear(),
      dateObj.getUTCMonth() + 1,
      dateObj.getUTCDate() + (dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60 + dateObj.getUTCSeconds() / 3600) / 24
    );

    // Moon position longitude
    const moonPos = moonposition.position(jd);
    const moonLongitude = moonPos.lon;

    const raasi = RAASI_NAMES[getRaasiIndex(moonLongitude)];
    const natchathiram = NAKSHATRA_NAMES[getNakshatraIndex(moonLongitude)];
    const raasi_en = RAASI_NAMES_EN[getRaasiIndex(moonLongitude)];
    const natchathiram_en = NAKSHATRA_NAMES_EN[getNakshatraIndex(moonLongitude)];

    const prediction_tamil = `வணக்கம் ${name}, உங்கள் ராசி ${raasi}, நட்சத்திரம் ${natchathiram}. இனிய நாள் வாழ்த்துகள்!`;
    const prediction_english = `Hello ${name}, your Raasi is ${raasi_en} and Nakshatra is ${natchathiram_en}. Have a great day!`;

    res.json({
      raasi_tamil: raasi,
      natchathiram_tamil: natchathiram,
      prediction_tamil,
      raasi_english: raasi_en,
      natchathiram_english: natchathiram_en,
      prediction_english
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error occurred.' });
  }
});

// Optional: serve frontend (if any)
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
