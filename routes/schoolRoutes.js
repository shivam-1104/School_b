import express from "express";
import { db } from "../db.js";
import { calculateDistance } from "../utils/distance.js";

const router = express.Router();


// POST /addSchool - Create one or more schools
router.post('/addSchool', async (req, res) => {
    let schools = Array.isArray(req.body) ? req.body : [req.body];
  
    const values = [];
  
    for (const school of schools) {
      const { name, address, latitude, longitude } = school;
  
      if (
        typeof name !== 'string' || name.trim() === '' ||
        typeof address !== 'string' || address.trim() === '' ||
        isNaN(latitude) || isNaN(longitude)
      ) {
        return res.status(400).json({
          error: 'All fields (name, address, latitude, longitude) are required and must be valid.'
        });
      }
  
      values.push([name, address, parseFloat(latitude), parseFloat(longitude)]);
    }
  
    try {
      const [result] = await db.query(
        'INSERT INTO schools (name, address, latitude, longitude) VALUES ?',
        [values]
      );
  
      res.status(201).json({
        message: `${result.affectedRows} school(s) added successfully.`
      });
    } catch (error) {
      console.error('Insert error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// POST  /listSchools
// Get a list of schools within a certain distance from a given location
router.post('/listSchools', async (req, res) => {
    const { latitude, longitude } = req.body;
  
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
  
    try {
      const [schools] = await db.execute('SELECT * FROM schools');
      const sorted = schools
        .map(school => ({
          ...school,
          distance: calculateDistance(
            latitude,
            longitude,
            school.latitude,
            school.longitude
          )
        }))
        .sort((a, b) => a.distance - b.distance);
  
      res.json(sorted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // GET /allSchools - Get all schools
router.get('/allSchools', async (req, res) => {
    try {
        const [schools] = await db.execute('SELECT * FROM schools');
        res.json(schools);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;