const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middlewares/auth');

app.use(express.json());
app.use(cors());


mongoose.connect("mongodb://localhost:27017/foodDonation")
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.log("Failed to connect to the database", err));


const donorSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  phoneNumber: String,
  password: String,
});

const Donor = mongoose.model("Donor", donorSchema);


const orgSchema = new mongoose.Schema({
  id: String,
  organizationName: String,
  ownerName: String,
  email: String,
  phoneNumber: String,
  password: String,
});

const Organization = mongoose.model("Organization", orgSchema);


app.post("/donorsignup", async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;
  try {
   
    const donor = await Donor.findOne({ email });
    if (donor) {
      return res.status(400).json({ message: "Email already exists" });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDonor = new Donor({
      id: uuidv4(),
      name,
      email,
      phoneNumber,
      password: hashedPassword,
    });

   
    await newDonor.save();
    res.json({ message: "Donor account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post("/orgsignup", async (req, res) => {
  const { organizationName, ownerName, email, phoneNumber, password } = req.body;
  try {
    
    const organization = await Organization.findOne({ email });
    if (organization) {
      return res.status(400).json({ message: "Email already exists" });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrganization = new Organization({
      id: uuidv4(),
      organizationName,
      ownerName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

  
    await newOrganization.save();
    res.json({ message: "Organization account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});


app.post("/donorlogin", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const donor = await Donor.findOne({ email }); 
      if (!donor) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, donor.password); 
      if (!isPasswordCorrect) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }
  
      const token = jwt.sign({ id: donor.id }, "Secret_key", { expiresIn: "1h" });
      res.status(200).json({ token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ success: false, message: "An error occurred during login" });
    }
  });

app.post("/orglogin", async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const org = await Organization.findOne({ email }); 
      
      if (!org) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, org.password); 
      if (!isPasswordCorrect) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }

      res.json({ success: true, message: "Login successful" });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ success: false, message: "An error occurred during login" });
    }
  });
  const donationSchema = new mongoose.Schema({
    id: { type: String, default: uuidv4 },
    items: [{ itemName: String, quantity: String }],
    contact: String,
    address: String,
    city: String,
    date: { type: String, default: new Date().toLocaleString() },
  });
  
  const Donation = mongoose.model('Donation', donationSchema);
  
  
  app.post("/donations", async (req, res) => {
    const { items, contact, address, city, date } = req.body;
  
    try {
     
      const newDonation = new Donation({
        items,
        contact,
        address,
        city,
        date,
      });
  
     
      await newDonation.save();
  
      res.json({ message: "Donation saved successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
 

  app.get("/donations/:contact",  async (req, res) => {
    const { contact } = req.params;
    if (!contact) {
      return res.status(400).json({ message: "Contact number is required" });
    }
  
    try {
      const donations = await Donation.find({ contact });
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching donation history" });
    }
  });

  app.delete("/donations/:contact", async (req, res) => {
    const { contact } = req.params;
    if (!contact) {
      return res.status(400).json({ message: "Contact number is required" });
    }
  
    try {
      await Donation.deleteMany({ contact });
      res.json({ message: "Donation history cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error clearing donation history" });
    }
  });

  app.get("/donations", async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Server error" });
  }
});
  