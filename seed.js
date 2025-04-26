import mongoose from "mongoose";
import { config } from "dotenv";
import plansData from "./Drefitness.plans.json";
import { v4 as uuidv4 } from "uuid"; // For generating transaction references
import Plan from "./models/plan";
import Member, { Counter } from "./models/member";
import { calculateEndDate, hashPassword } from "./lib/util";

config();

// const counterSchema = new mongoose.Schema({
//   collectionName: { type: String, required: true },
//   count: { type: Number, default: 0 },
// });

// const Counter = mongoose.model("Counter", counterSchema);

const nigerianNames = [
  { firstName: "Chukwudi", lastName: "Okeke", gender: "male" },
  { firstName: "Ngozi", lastName: "Adebayo", gender: "female" },
  { firstName: "Olumide", lastName: "Ibrahim", gender: "male" },
  { firstName: "Aisha", lastName: "Suleiman", gender: "female" },
  { firstName: "Emeka", lastName: "Chukwu", gender: "male" },
  { firstName: "Funmilayo", lastName: "Ogunleye", gender: "female" },
  { firstName: "Tunde", lastName: "Balogun", gender: "male" },
  { firstName: "Chioma", lastName: "Eze", gender: "female" },
  { firstName: "Yusuf", lastName: "Abdullahi", gender: "male" },
  { firstName: "Amaka", lastName: "Nwosu", gender: "female" },
  { firstName: "Segun", lastName: "Akinyemi", gender: "male" },
  { firstName: "Hauwa", lastName: "Bello", gender: "female" },
  { firstName: "Ifeanyi", lastName: "Okafor", gender: "male" },
  { firstName: "Kemi", lastName: "Adetunji", gender: "female" },
  { firstName: "Ahmed", lastName: "Lawal", gender: "male" },
];
const addresses = {
  "ilorin-gra": {
    street: "1 Ahmadu Bello Way",
    city: "Ilorin",
    state: "Kwara",
    country: "Nigeria",
  },
  "ilorin-tanke": {
    street: "10 University Road, Tanke",
    city: "Ilorin",
    state: "Kwara",
    country: "Nigeria",
  },
  "abuja-wuse": {
    street: "25 Aminu Kano Crescent",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
  },
};

// Plan IDs by Branch
const planIds = {
  "ilorin-gra": {
    individual: "67d193764f6e0dccb8277e7d",
    couple: "67d19044aa1d17317dc3c4f2",
    family: "67d1935f4f6e0dccb8277e77",
  },
  "ilorin-tanke": {
    individual: "67f43a3ce799038c6c56eb42",
    couple: "67f43a1fe799038c6c56eb3e",
    family: "67f43a04e799038c6c56eb3a",
  },
  "abuja-wuse": {
    individual: "67f43a8de799038c6c56eb46",
    couple: "67f43aace799038c6c56eb4a",
    family: "67f43ac5e799038c6c56eb4e",
  },
};

// Generate Random Date of Birth
function randomDateOfBirth() {
  const start = new Date(1970, 0, 1);
  const end = new Date(2005, 0, 1);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Generate Phone Number
function generatePhoneNumber() {
  const prefix = "+234";
  const number = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix}${number}`;
}

// Seed Function
export async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/drefitness"
    );
    console.log("Connected to MongoDB");

    // Clear Collections
    await Counter.deleteMany({});
    await Plan.deleteMany({});
    await Member.deleteMany({});
    console.log("Cleared existing collections");

    // Seed Counter
    await Counter.create({ collectionName: "members", count: 0 });
    console.log("Seeded Counter collection");

    // Seed Plans
    const plansToInsert = plansData.map((plan) => ({
      _id: plan._id.$oid,
      planId: plan.planId,
      name: plan.name,
      planType: plan.planType,
      gymLocation: plan.gymLocation,
      gymBranch: plan.gymBranch,
      benefits: plan.benefits,
      price: plan.price,
      duration: plan.duration,
    }));
    for (const plan of plansToInsert) {
      await Plan.findOneAndUpdate({ _id: plan._id }, plan, {
        upsert: true,
        new: true,
      });
    }
    console.log(`Seeded ${plansToInsert.length} plans`);

    // Seed Members
    const branches = ["ilorin-gra", "ilorin-tanke", "abuja-wuse"];
    const insertedMembers = [];
    let nameIndex = 0;
    const currentDate = new Date();
    const hashedPassword = await hashPassword("123456789");

    for (const branch of branches) {
      // Individual Members (5 per branch)
      for (let i = 0; i < 5; i++) {
        const name = nigerianNames[nameIndex % nigerianNames.length];
        const email = `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}${nameIndex}@example.com`;
        const startDate = currentDate;
        const plan = await Plan.findById(planIds[branch].individual);
        const endDate = calculateEndDate(startDate, plan.duration);
        const member = await Member.create({
          firstName: name.firstName,
          lastName: name.lastName,
          email,
          password: hashedPassword,
          phoneNumber: generatePhoneNumber(),
          dateOfBirth: randomDateOfBirth(),
          gender: name.gender,
          address: addresses[branch],
          emergencyContact: {
            fullName: `${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].firstName
            } ${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].lastName
            }`,
            phoneNumber: generatePhoneNumber(),
            relationship: "friend",
          },
          role: "member",
          isActive: true,
          registrationDate: currentDate,
          currentSubscription: {
            plan: planIds[branch].individual,
            subscriptionStatus: "active",
            startDate,
            endDate,
            autoRenew: false,
            paymentMethod: "card",
            paymentStatus: "approved",
            transactionReference: uuidv4().slice(0, 10),
          },
          membershipHistory: [
            {
              plan: planIds[branch].individual,
              startDate,
              endDate,
            },
          ],
          isGroup: false,
          groupRole: "none",
        });
        insertedMembers.push(member);
        nameIndex++;
      }

      // Couple Members (2 couples = 4 members per branch)
      for (let i = 0; i < 2; i++) {
        // Primary Member
        const primaryName = nigerianNames[nameIndex % nigerianNames.length];
        const primaryEmail = `${primaryName.firstName.toLowerCase()}.${primaryName.lastName.toLowerCase()}${nameIndex}@example.com`;
        const startDate = currentDate;
        const plan = await Plan.findById(planIds[branch].couple);
        const endDate = calculateEndDate(startDate, plan.duration);
        const primaryMember = await Member.create({
          firstName: primaryName.firstName,
          lastName: primaryName.lastName,
          email: primaryEmail,
          password: hashedPassword,
          phoneNumber: generatePhoneNumber(),
          dateOfBirth: randomDateOfBirth(),
          gender: primaryName.gender,
          address: addresses[branch],
          emergencyContact: {
            fullName: `${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].firstName
            } ${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].lastName
            }`,
            phoneNumber: generatePhoneNumber(),
            relationship: "spouse",
          },
          role: "member",
          isActive: true,
          registrationDate: currentDate,
          currentSubscription: {
            plan: planIds[branch].couple,
            subscriptionStatus: "active",
            startDate,
            endDate,
            autoRenew: false,
            paymentMethod: "card",
            paymentStatus: "approved",
            transactionReference: uuidv4().slice(0, 10),
          },
          membershipHistory: [
            {
              plan: planIds[branch].couple,
              startDate,
              endDate,
            },
          ],
          isGroup: true,
          groupRole: "primary",
          groupSubscription: {
            groupType: "couple",
            groupMaxMember: 2,
            groupInviteToken: uuidv4(),
            dependantMembers: [],
          },
        });
        insertedMembers.push(primaryMember);
        nameIndex++;

        // Dependant Member
        const dependantName = nigerianNames[nameIndex % nigerianNames.length];
        const dependantEmail = `${dependantName.firstName.toLowerCase()}.${dependantName.lastName.toLowerCase()}${nameIndex}@example.com`;
        const dependantMember = await Member.create({
          firstName: dependantName.firstName,
          lastName: dependantName.lastName,
          email: dependantEmail,
          password: hashedPassword,
          phoneNumber: generatePhoneNumber(),
          dateOfBirth: randomDateOfBirth(),
          gender: dependantName.gender,
          address: addresses[branch],
          emergencyContact: {
            fullName: `${primaryName.firstName} ${primaryName.lastName}`,
            phoneNumber: generatePhoneNumber(),
            relationship: "spouse",
          },
          role: "member",
          isActive: true,
          registrationDate: currentDate,
          currentSubscription: {
            plan: planIds[branch].couple,
            subscriptionStatus: "active",
            startDate,
            endDate,
            autoRenew: false,
            paymentMethod: "card",
            paymentStatus: "approved",
            transactionReference: uuidv4().slice(0, 10),
          },
          membershipHistory: [
            {
              plan: planIds[branch].couple,
              startDate,
              endDate,
            },
          ],
          isGroup: true,
          groupRole: "dependant",
          groupSubscription: {
            groupType: "couple",
            primaryMember: primaryMember._id,
          },
        });
        insertedMembers.push(dependantMember);

        // Update Primary Member's dependantMembers
        primaryMember.groupSubscription.dependantMembers.push({
          member: dependantMember._id,
          status: "active",
          joinedAt: currentDate,
        });
        await primaryMember.save();
        nameIndex++;
      }

      // Family Members (2 families = 6 members per branch, 1 primary + 2 dependants each)
      for (let i = 0; i < 2; i++) {
        // Primary Member
        const primaryName = nigerianNames[nameIndex % nigerianNames.length];
        const primaryEmail = `${primaryName.firstName.toLowerCase()}.${primaryName.lastName.toLowerCase()}${nameIndex}@example.com`;
        const startDate = currentDate;
        const plan = await Plan.findById(planIds[branch].family);
        const endDate = calculateEndDate(startDate, plan.duration);
        const primaryMember = await Member.create({
          firstName: primaryName.firstName,
          lastName: primaryName.lastName,
          email: primaryEmail,
          password: hashedPassword,
          phoneNumber: generatePhoneNumber(),
          dateOfBirth: randomDateOfBirth(),
          gender: primaryName.gender,
          address: addresses[branch],
          emergencyContact: {
            fullName: `${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].firstName
            } ${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].lastName
            }`,
            phoneNumber: generatePhoneNumber(),
            relationship: "spouse",
          },
          role: "member",
          isActive: true,
          registrationDate: currentDate,
          currentSubscription: {
            plan: planIds[branch].family,
            subscriptionStatus: "active",
            startDate,
            endDate,
            autoRenew: false,
            paymentMethod: "card",
            paymentStatus: "approved",
            transactionReference: uuidv4().slice(0, 10),
          },
          membershipHistory: [
            {
              plan: planIds[branch].family,
              startDate,
              endDate,
            },
          ],
          isGroup: true,
          groupRole: "primary",
          groupSubscription: {
            groupType: "family",
            groupMaxMember: 4,
            groupInviteToken: uuidv4(),
            dependantMembers: [],
          },
        });
        insertedMembers.push(primaryMember);
        nameIndex++;

        // Two Dependant Members
        for (let j = 0; j < 2; j++) {
          const dependantName = nigerianNames[nameIndex % nigerianNames.length];
          const dependantEmail = `${dependantName.firstName.toLowerCase()}.${dependantName.lastName.toLowerCase()}${nameIndex}@example.com`;
          const dependantMember = await Member.create({
            firstName: dependantName.firstName,
            lastName: dependantName.lastName,
            email: dependantEmail,
            password: hashedPassword,
            phoneNumber: generatePhoneNumber(),
            dateOfBirth: randomDateOfBirth(),
            gender: dependantName.gender,
            address: addresses[branch],
            emergencyContact: {
              fullName: `${primaryName.firstName} ${primaryName.lastName}`,
              phoneNumber: generatePhoneNumber(),
              relationship: j === 0 ? "spouse" : "child",
            },
            role: "member",
            isActive: true,
            registrationDate: currentDate,
            currentSubscription: {
              plan: planIds[branch].family,
              subscriptionStatus: "active",
              startDate,
              endDate,
              autoRenew: false,
              paymentMethod: "card",
              paymentStatus: "approved",
              transactionReference: uuidv4().slice(0, 10),
            },
            membershipHistory: [
              {
                plan: planIds[branch].family,
                startDate,
                endDate,
              },
            ],
            isGroup: true,
            groupRole: "dependant",
            groupSubscription: {
              groupType: "family",
              primaryMember: primaryMember._id,
            },
          });
          insertedMembers.push(dependantMember);

          // Update Primary Member's dependantMembers
          primaryMember.groupSubscription.dependantMembers.push({
            member: dependantMember._id,
            status: "active",
            joinedAt: currentDate,
          });
          await primaryMember.save();
          nameIndex++;
        }
      }
    }

    console.log(`Seeded ${insertedMembers.length} members`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// seedDatabase();
