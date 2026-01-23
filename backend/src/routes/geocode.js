// routes/geocode.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/reverse", async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'Accept': 'application/json',
            'User-Agent': 'CitiSolve/1.0'
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Geocoding failed" });
  }
});

export default router;