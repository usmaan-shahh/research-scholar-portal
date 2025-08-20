import mongoose from "mongoose";
import Scholar from "../models/Scholar.js";
import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

const createDemoScholars = async () => {
  try {
    // Get existing departments and faculties
    const departments = await Department.find();
    const faculties = await Faculty.find();

    if (departments.length === 0) {
      console.log("No departments found. Please create departments first.");
      return;
    }

    if (faculties.length === 0) {
      console.log("No faculties found. Please create faculties first.");
      return;
    }

    // Sample scholar data
    const demoScholars = [
      {
        name: "Ahmed Khan",
        email: "ahmed.khan@university.edu",
        phone: "+92-300-1234567",
        address: "House 45, Street 12, Islamabad",
        rollNo: "2024-PHD-CSE-001",
        pgDegree: "M.Tech Computer Science",
        pgCgpa: 3.8,
        bgDegree: "B.Tech Computer Science",
        bgCgpa: 3.6,
        regId: "REG-2024-CSE-001",
        dateOfAdmission: "2024-01-15",
        dateOfJoining: "2024-02-01",
        areaOfResearch: "Machine Learning and Artificial Intelligence",
        synopsisTitle:
          "Deep Learning Approaches for Natural Language Processing",
        supervisor: faculties[0]._id,
        departmentCode: departments[0].code,
      },
      {
        name: "Fatima Zahra",
        email: "fatima.zahra@university.edu",
        phone: "+92-300-2345678",
        address: "Apartment 23, Block C, Lahore",
        rollNo: "2024-PHD-EE-001",
        pgDegree: "M.Eng Electrical Engineering",
        pgCgpa: 3.9,
        bgDegree: "B.Eng Electrical Engineering",
        bgCgpa: 3.7,
        regId: "REG-2024-EE-001",
        dateOfAdmission: "2024-01-20",
        dateOfJoining: "2024-02-05",
        areaOfResearch: "Power Systems and Renewable Energy",
        synopsisTitle:
          "Smart Grid Technologies for Sustainable Energy Management",
        supervisor: faculties[1] ? faculties[1]._id : faculties[0]._id,
        departmentCode: departments[1]
          ? departments[1].code
          : departments[0].code,
      },
      {
        name: "Muhammad Ali",
        email: "muhammad.ali@university.edu",
        phone: "+92-300-3456789",
        address: "Villa 7, Garden Town, Karachi",
        rollNo: "2024-PHD-MATH-001",
        pgDegree: "M.Sc Mathematics",
        pgCgpa: 3.7,
        bgDegree: "B.Sc Mathematics",
        bgCgpa: 3.5,
        regId: "REG-2024-MATH-001",
        dateOfAdmission: "2024-01-25",
        dateOfJoining: "2024-02-10",
        areaOfResearch: "Applied Mathematics and Optimization",
        synopsisTitle: "Mathematical Modeling for Financial Risk Assessment",
        supervisor: faculties[2] ? faculties[2]._id : faculties[0]._id,
        departmentCode: departments[2]
          ? departments[2].code
          : departments[0].code,
      },
      {
        name: "Ayesha Malik",
        email: "ayesha.malik@university.edu",
        phone: "+92-300-4567890",
        address: "House 89, Street 8, Rawalpindi",
        rollNo: "2024-PHD-CHEM-001",
        pgDegree: "M.Sc Chemistry",
        pgCgpa: 3.6,
        bgDegree: "B.Sc Chemistry",
        bgCgpa: 3.4,
        regId: "REG-2024-CHEM-001",
        dateOfAdmission: "2024-02-01",
        dateOfJoining: "2024-02-15",
        areaOfResearch: "Organic Chemistry and Drug Discovery",
        synopsisTitle:
          "Synthesis and Characterization of Novel Pharmaceutical Compounds",
        supervisor: faculties[3] ? faculties[3]._id : faculties[0]._id,
        departmentCode: departments[3]
          ? departments[3].code
          : departments[0].code,
      },
      {
        name: "Hassan Raza",
        email: "hassan.raza@university.edu",
        phone: "+92-300-5678901",
        address: "Flat 12, Tower A, Faisalabad",
        rollNo: "2024-PHD-PHYS-001",
        pgDegree: "M.Sc Physics",
        pgCgpa: 3.8,
        bgDegree: "B.Sc Physics",
        bgCgpa: 3.6,
        regId: "REG-2024-PHYS-001",
        dateOfAdmission: "2024-02-05",
        dateOfJoining: "2024-02-20",
        areaOfResearch: "Quantum Physics and Nanotechnology",
        synopsisTitle: "Quantum Computing Applications in Cryptography",
        supervisor: faculties[4] ? faculties[4]._id : faculties[0]._id,
        departmentCode: departments[4]
          ? departments[4].code
          : departments[0].code,
      },
    ];

    // Create scholars
    for (const scholarData of demoScholars) {
      try {
        const existingScholar = await Scholar.findOne({
          $or: [
            { email: scholarData.email },
            { rollNo: scholarData.rollNo },
            { regId: scholarData.regId },
          ],
        });

        if (!existingScholar) {
          const scholar = await Scholar.create(scholarData);
          console.log(
            `✅ Created scholar: ${scholar.name} (${scholar.rollNo})`
          );
        } else {
          console.log(
            `⏭️  Scholar already exists: ${scholarData.name} (${scholarData.rollNo})`
          );
        }
      } catch (error) {
        console.error(
          `❌ Error creating scholar ${scholarData.name}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Demo scholars creation completed!");

    // Display summary
    const totalScholars = await Scholar.countDocuments();
    console.log(`📊 Total scholars in database: ${totalScholars}`);
  } catch (error) {
    console.error("Error creating demo scholars:", error);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB().then(() => createDemoScholars());
}
